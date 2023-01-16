import * as dotenv from "dotenv";
import fs from "fs";
import { Storage } from "@google-cloud/storage";

const getBlog = async () => {
  // list images present in the images `blog` folder of the public GCP bucket in an array
  dotenv.config();
  const storage = new Storage();
  const publicImagesBucketName = process.env
    .PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME as string;
  const publicImagesFolderPrefix = process.env
    .PUBLIC_IMAGES_GCP_STORAGE_BUCKET_NAME_BLOG_PREFIX as string;
  const listingOptions = {
    prefix: publicImagesFolderPrefix,
  };
  const [publicImages] = await storage
    .bucket(publicImagesBucketName)
    .getFiles(listingOptions);
  for (let i = 0; i < publicImages.length; i++) {
    const image = publicImages[i];
    // TODO if any public images, populate the local filesystem in the `./blog/published/images` folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
    const destFileOptions = {
      destination: `./blog/published/images/${image.name.replace(
        publicImagesFolderPrefix + "/",
        ""
      )}`,
    };
    if (!fs.existsSync(destFileOptions.destination)) {
      await storage
        .bucket(publicImagesBucketName)
        .file(image.name)
        .download(destFileOptions);
    }
  }
  // TODO list images present in the `./drafts/images` folder of the blog posts private GCP bucket in an array or create the folder in the bucket if it doesn't exist
  // TODO if any private images, populate the local filesystem in the `./blog/drafts/images` folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
  // TODO list blog posts from the GCP storage bucket in an array and make a distinction between draft and published posts (create `drafts` and `published` folders in the GCP bucket if they don't exist)
  // TODO if posts, populate the local filesystem in the correct directories with the blog posts from the GCP bucket unless they already exist locally and the local copy is more recent than the GCP one
};

getBlog();
