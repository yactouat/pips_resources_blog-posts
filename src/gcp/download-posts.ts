import fs from "fs";
import { Storage } from "@google-cloud/storage";

import getGcpPostContents from "./get-gcp-post-contents";
import postIsMoreRecent from "../meta/post-is-more-recent";

const downloadPosts = async (
  storage: Storage,
  gcpBucketName: string
): Promise<string[]> => {
  const gcpPostsList: string[] = [];
  // getting blog posts from the GCP storage bucket
  const [gcpBucketPosts] = await storage.bucket(gcpBucketName).getFiles();
  // iterate over Markdown posts
  for (let i = 0; i < gcpBucketPosts.length; i++) {
    if (gcpBucketPosts[i].name.toLowerCase().endsWith(".md")) {
      const gcpBucketPost = gcpBucketPosts[i];
      gcpPostsList.push(gcpBucketPost.name);
      // name of the post to be created/updated locally
      const localPostPath = `blog/${gcpBucketPost.name}`;
      let canWriteLocally = true;
      const gcpBucketPostContents = await getGcpPostContents(
        gcpBucketPost.name,
        gcpBucketName,
        storage
      );
      try {
        // get the metadata of the local post with the same name if exists
        if (fs.existsSync(localPostPath)) {
          // if the GCP post is more recent than the local one, update the local one
          canWriteLocally = postIsMoreRecent(
            // convert the buffer to a string
            gcpBucketPostContents,
            fs.readFileSync(localPostPath, "utf8")
          );
        }
        if (canWriteLocally != false) {
          // write the post to the local filesystem
          fs.writeFileSync(localPostPath, gcpBucketPostContents);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  return gcpPostsList;
};

export default downloadPosts;
