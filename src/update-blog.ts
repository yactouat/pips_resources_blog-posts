import * as dotenv from "dotenv";
import fs from "fs";
import { Storage } from "@google-cloud/storage";

import {
  downloadBlogPostsAndPopulateLocalFileSystem,
  downloadImagesAndPopulateLocalFileSystem,
} from "./get-blog";

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
  // list blog public images present in the local filesystem
  const localPublicBlogImages = fs
    .readdirSync("blog/published/images")
    .filter((fileName) => {
      return (
        fileName.toLowerCase().endsWith(".gif") ||
        fileName.toLowerCase().endsWith(".jpg") ||
        fileName.toLowerCase().endsWith(".jpeg") ||
        fileName.toLowerCase().endsWith(".png") ||
        fileName.toLowerCase().endsWith(".webp")
      );
    });
  // list images present in the images `blog` folder of the public GCP images bucket
  const gcpPublicBlogImagesBucketName = process.env
    .PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME as string;
  const gcpPublicBlogImages = await downloadImagesAndPopulateLocalFileSystem(
    storage,
    gcpPublicBlogImagesBucketName,
    "blog/published/images",
    process.env.PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME_BLOG_PREFIX ?? "/"
  );
  // list images present in the `drafts/images` folder of the blog posts private GCP bucket
  const gcpPrivateBlogImages = await downloadImagesAndPopulateLocalFileSystem(
    storage,
    postsGCPBucketName,
    "blog/drafts/images",
    "drafts/images"
  );
  // send all new public images to the public images GCP bucket
  for (let i = 0; i < localPublicBlogImages.length; i++) {
    const image = localPublicBlogImages[i];
    console.log(image, gcpPublicBlogImages);
    if (!gcpPublicBlogImages.includes(`blog/published/images/${image}`)) {
      await storage
        .bucket(gcpPublicBlogImagesBucketName)
        .upload(`blog/published/images/${image}`, {
          destination: `${process.env.PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME_BLOG_PREFIX}/${image}`,
        });
    }
  }

  // TODO add local images to an array of images to create if they dont exist on either the public or private GCP buckets for images (depending on whether they are draft or published blog posts associated images)
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
