import * as dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";

import downloadImages from "../gcp/download-images";
import downloadPosts from "../gcp/download-posts";

const getBlog = async () => {
  console.log("Getting blog contents ...");
  dotenv.config();
  const storage = new Storage();
  const gcpBucket = process.env.BLOGPOSTS_GCP_BUCKET as string;
  // list images present in the `public` folder of the GCP images bucket and populate local filesystem with them under `blog/published/images`
  await downloadImages(
    storage,
    process.env.IMAGES_GCP_BUCKET as string,
    "blog/published/images",
    "public/blog"
  );
  // list images present in the `private` folder of the the GCP images bucket and populate local filesystem with them under `blog/drafts/images`
  await downloadImages(
    storage,
    gcpBucket,
    "blog/drafts/images",
    "private/blog"
  );
  // populate local filesystem with the blog posts from the GCP bucket
  await downloadPosts(storage, gcpBucket);
  console.log("Got blog contents ...");
};

// calling `getBlog` on `npm run get-blog`
const { argv } = require("process");
if (argv[1].endsWith("get-blog.ts")) {
  getBlog();
}
