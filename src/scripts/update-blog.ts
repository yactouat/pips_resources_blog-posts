import * as dotenv from "dotenv";
import fs from "fs";
import { Storage } from "@google-cloud/storage";

import downloadImages from "../gcp/download-images";
import downloadPosts from "../gcp/download-posts";
import getGcpPostContents from "../gcp/get-gcp-post-contents";
import postIsMoreRecent from "../meta/post-is-more-recent";

const getFileNameAfterLastSlash = (filePath: string): string => {
  return filePath.split("/").pop() ?? "";
};

const isImage = (fileName: string): boolean => {
  return (
    fileName.toLowerCase().endsWith(".gif") ||
    fileName.toLowerCase().endsWith(".jpg") ||
    fileName.toLowerCase().endsWith(".jpeg") ||
    fileName.toLowerCase().endsWith(".png") ||
    fileName.toLowerCase().endsWith(".webp")
  );
};

const sendNewImagesToGCPBucket = async (
  localImagesFolder: string,
  storage: Storage,
  gcpBucket: string,
  gcpImagesFolder: string
): Promise<void> => {
  // list blog images present in the local filesystem
  const localImages = fs
    .readdirSync(localImagesFolder)
    .filter((fileName) => isImage(fileName))
    .map((fileName) => `${localImagesFolder}/${fileName}`);
  // list images present in GCP bucket relevant images folder
  const gcpBucketImages = await downloadImages(
    storage,
    gcpBucket,
    localImagesFolder,
    gcpImagesFolder
  );
  // send all new images to the relevant GCP bucket
  for (let i = 0; i < localImages.length; i++) {
    const imageName = getFileNameAfterLastSlash(localImages[i]);
    if (
      !gcpBucketImages
        .map((fileName) => getFileNameAfterLastSlash(fileName))
        .includes(imageName)
    ) {
      await storage
        .bucket(gcpBucket)
        .upload(`${localImagesFolder}/${imageName}`, {
          destination: `${gcpImagesFolder}/${imageName}`,
        });
    }
  }
};

const updateBlog = async () => {
  console.log("Updating blog...");
  dotenv.config();
  const storage = new Storage();
  const gcpBucket = process.env.BLOGPOSTS_GCP_BUCKET as string;
  // populate the local filesystem with the latest blog posts and images from the GCP bucket
  const gcpPosts = await downloadPosts(storage, gcpBucket);
  // send new images (private and public) to the relevant GCP bucket
  await sendNewImagesToGCPBucket(
    "blog/published/images",
    storage,
    process.env.IMAGES_GCP_BUCKET as string,
    "public/blog"
  );
  await sendNewImagesToGCPBucket(
    "blog/drafts/images",
    storage,
    gcpBucket,
    "private/blog"
  );
  // compare list of blog posts from the GCP with the list of blog posts from the local filesystem
  const localPublishedPosts = fs
    .readdirSync("blog/published")
    .map((fileName) => `published/${fileName}`)
    .filter((fileName) => fileName.toLowerCase().endsWith(".md"));
  const localDraftPosts = fs
    .readdirSync("blog/drafts")
    .map((fileName) => `drafts/${fileName}`)
    .filter((fileName) => fileName.toLowerCase().endsWith(".md"));
  const localPosts = [...localPublishedPosts, ...localDraftPosts];
  for (let i = 0; i < localPosts.length; i++) {
    const localPostName = localPosts[i];
    let canWriteLocalPostToGCPBucket = false;
    if (!gcpPosts.includes(localPostName)) {
      canWriteLocalPostToGCPBucket = true;
    } else {
      const gcpBucketPostName = gcpPosts.find((name) => name === localPostName);
      const gcpBucketPostContents = await getGcpPostContents(
        gcpBucketPostName as string,
        gcpBucket,
        storage
      );
      canWriteLocalPostToGCPBucket = postIsMoreRecent(
        fs.readFileSync(`blog/${localPostName}`, "utf8"),
        gcpBucketPostContents
      );
    }
    if (canWriteLocalPostToGCPBucket) {
      await storage.bucket(gcpBucket).upload(`blog/${localPostName}`, {
        destination: localPostName,
      });
    }
  }
  await fetch("https://api.yactouat.com/builds", {
    body: JSON.stringify({
      vercelToken: process.env.VERCEL_TOKEN,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  console.log("Blog updated...");
};

updateBlog();
