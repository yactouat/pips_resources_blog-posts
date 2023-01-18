import * as dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";

import downloadImages from "../gcp/download-images";
import downloadPosts from "../gcp/download-posts";

const getBlog = async () => {
  console.log("Getting blog data ...");
  dotenv.config();
  const storage = new Storage();
  const gcpBucket = process.env.POSTS_GCP_BUCKET as string;
  // list images present in the images `blog` folder of the public GCP images bucket and populate local filesystem with them
  await downloadImages(
    storage,
    process.env.IMAGES_GCP_BUCKET as string,
    "blog/published/images",
    process.env.IMAGES_GCP_BUCKET_PREFIX ?? "/"
  );
  // list images present in the `./drafts/images` folder of the blog posts private GCP bucket and populate local filesystem with them
  // if any private images, populate the local filesystem in the `blog/drafts/images` folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
  await downloadImages(
    storage,
    gcpBucket,
    "blog/drafts/images",
    "drafts/images"
  );
  // populate local filesystem with the blog posts from the GCP bucket
  await downloadPosts(storage, gcpBucket);
  console.log("Got blog data ...");
};

// calling `getBlog` on `npm run get-blog`
const { argv } = require("process");
if (argv[1].endsWith("get-blog.ts")) {
  getBlog();
}
