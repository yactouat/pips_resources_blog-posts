import * as dotenv from "dotenv";
import fs from "fs";
import { Storage } from "@google-cloud/storage";

import {
  downloadBlogPostsAndPopulateLocalFileSystem,
  downloadImagesAndPopulateLocalFileSystem,
} from "./get-blog";

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
  gcpImagesBucketName: string,
  gcpImagesFolder: string
): Promise<void> => {
  // list blog images present in the local filesystem
  const localImages = fs
    .readdirSync(localImagesFolder)
    .filter((fileName) => isImage(fileName))
    .map((fileName) => `${localImagesFolder}/${fileName}`);
  // list images present in GCP bucket relevant images folder
  const gcpBucketImages = await downloadImagesAndPopulateLocalFileSystem(
    storage,
    gcpImagesBucketName,
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
        .bucket(gcpImagesBucketName)
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
  const postsGCPBucketName = process.env
    .PRIVATE_BLOG_POSTS_GCP_STORAGE_BUCKET_NAME as string;
  // populate the local filesystem with the latest blog posts and images from the GCP bucket
  const gcpBlogPosts = await downloadBlogPostsAndPopulateLocalFileSystem(
    storage,
    postsGCPBucketName
  );
  // send new images (private and public) to the relevant GCP bucket
  await sendNewImagesToGCPBucket(
    "blog/published/images",
    storage,
    process.env.PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME as string,
    process.env.PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME_BLOG_PREFIX ?? "/"
  );
  await sendNewImagesToGCPBucket(
    "blog/drafts/images",
    storage,
    postsGCPBucketName,
    "drafts/images"
  );

  // TODO create each image from the array of images to create in the right directory on the right GCP bucket (wheter associated with published or draft post) + verify that the images were created
  // TODO add local blog posts to an array of blog posts to create if they are not already in the fetched blog array
  // TODO add local blog posts to an array of blog posts to update if their date differs from the GCP bucket copy for the same file and is more recent than the latter
  // TODO create each blog post from the array of blog posts to create in the right directory on the GCP bucket + verify that the blog posts were created
  // TODO update each blog post from the array of blog posts to update in the right directory on the GCP bucket + verify that the blog posts were updated
  // TODO change api.yactouat.com so that it only fetches blog posts from the `published` folder of the GCP bucket
  // TODO trigger a new build of the NextJS website by sending a request to api.yactouat.com

  console.log("Blog updated...");
};

updateBlog();
