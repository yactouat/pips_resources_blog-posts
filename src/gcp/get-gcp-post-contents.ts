import { Storage } from "@google-cloud/storage";

const getGcpPostContents = async (
  postName: string,
  gcpBucketName: string,
  storage: Storage
) => {
  // get the contents of the post as a buffer
  const gcpBucketPostInMemory = await storage
    .bucket(gcpBucketName)
    .file(postName)
    .download();
  return gcpBucketPostInMemory[0].toString();
};

export default getGcpPostContents;
