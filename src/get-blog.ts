import * as dotenv from "dotenv";
import fs from "fs";
import { Storage } from "@google-cloud/storage";

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
  // list images present in the `./drafts/images` folder of the blog posts private GCP bucket and populate local filesystem with them
  // if any private images, populate the local filesystem in the `./blog/drafts/images` folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
  await downloadImagesAndPopulateLocalFileSystem(
    storage,
    process.env.PRIVATE_BLOG_POSTS_GCP_STORAGE_BUCKET_NAME as string,
    "./blog/drafts/images",
    "drafts/images"
  );
  // TODO list blog posts from the GCP storage bucket in an array and make a distinction between draft and published posts (create `drafts` and `published` folders in the GCP bucket if they don't exist)
  // TODO if posts, populate the local filesystem in the correct directories with the blog posts from the GCP bucket unless they already exist locally and the local copy is more recent than the GCP one
};

getBlog();
