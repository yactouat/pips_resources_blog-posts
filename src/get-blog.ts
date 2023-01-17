import * as dotenv from "dotenv";
import fs from "fs";
import { Storage } from "@google-cloud/storage";
import matter from "gray-matter";

interface PostMetaData {
  date: string;
  slug: string;
  title: string;
}

const downloadImagesAndPopulateLocalFileSystem = async (
  storage: Storage,
  bucketName: string,
  destDir: string, // e.g. "./blog/published/images"
  gcpFolderPrefix: string = "/"
) => {
  const listingOptions = {
    prefix: gcpFolderPrefix,
  };
  const [images] = await storage.bucket(bucketName).getFiles(listingOptions);
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    // if any images, populate the local filesystem in the blog's relevant folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
    const destFileOptions = {
      destination: `${destDir}/${image.name.replace(
        gcpFolderPrefix + "/",
        ""
      )}`,
    };
    if (!fs.existsSync(destFileOptions.destination)) {
      await storage
        .bucket(bucketName)
        .file(image.name)
        .download(destFileOptions);
    }
  }
};

const extractPostMetadataFromRawPost = (postContents: string): PostMetaData => {
  // Use gray-matter to parse the post metadata section
  const postMetadata = matter(postContents);
  if (
    postMetadata.data.date == undefined ||
    postMetadata.data.slug == undefined ||
    postMetadata.data.title == undefined
  ) {
    throw new Error("post metadata is missing");
  }
  // Combine the metadata with the slug
  return {
    date: postMetadata.data.date,
    slug: postMetadata.data.slug,
    title: postMetadata.data.title,
  };
};

const getBlog = async () => {
  // list images present in the images `blog` folder of the public GCP bucket and populate local filesystem with them
  dotenv.config();
  const storage = new Storage();
  await downloadImagesAndPopulateLocalFileSystem(
    storage,
    process.env.PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME as string,
    "./blog/published/images",
    process.env.PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME_BLOG_PREFIX ?? "/"
  );
  const postsGCPBucketName = process.env
    .PRIVATE_BLOG_POSTS_GCP_STORAGE_BUCKET_NAME as string;
  // list images present in the `./drafts/images` folder of the blog posts private GCP bucket and populate local filesystem with them
  // if any private images, populate the local filesystem in the `./blog/drafts/images` folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
  await downloadImagesAndPopulateLocalFileSystem(
    storage,
    postsGCPBucketName,
    "./blog/drafts/images",
    "drafts/images"
  );
  // getting blog posts from the GCP storage bucket
  const [gcpBucketPosts] = await storage.bucket(postsGCPBucketName).getFiles();
  // iterate over Markdown posts
  for (let i = 0; i < gcpBucketPosts.length; i++) {
    if (gcpBucketPosts[i].name.endsWith(".md")) {
      const gcpBucketPost = gcpBucketPosts[i];
      // name of the post to be created/updated locally
      const localPostPath = `blog/${gcpBucketPost.name}`;
      let canWriteGCPBucketPostLocally = true;
      // get the contents of the post as a buffer
      const gcpBucketPostInMemory = await storage
        .bucket(postsGCPBucketName)
        .file(gcpBucketPost.name)
        .download();
      // convert the buffer to a string
      const gcpBucketPostContents = gcpBucketPostInMemory[0].toString();
      try {
        // get the metadata of the GCP bucket post
        const gcpBucketPostMetadata = extractPostMetadataFromRawPost(
          gcpBucketPostContents
        );
        // get the metadata of the local post with the same name if exists
        if (fs.existsSync(localPostPath)) {
          const localPostMetadata = extractPostMetadataFromRawPost(
            fs.readFileSync(localPostPath, "utf8")
          );
          // if the GCP post is more recent than the local one, update the local one
          canWriteGCPBucketPostLocally =
            Date.parse(gcpBucketPostMetadata.date) >
            Date.parse(localPostMetadata.date);
        }
        if (canWriteGCPBucketPostLocally != false) {
          // write the post to the local filesystem
          fs.writeFileSync(localPostPath, gcpBucketPostContents);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};

getBlog();
