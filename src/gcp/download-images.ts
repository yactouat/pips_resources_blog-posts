import fs from "fs";
import { Storage } from "@google-cloud/storage";

/**
 *
 * @param {Storage} storage
 * @param {string} gcpBucketName
 * @param {string} localDestinationFolder
 * @param {string} gcpFolderPrefix
 * @returns a list of the images present in the GCP bucket folder
 */
const downloadImages = async (
  storage: Storage,
  gcpBucketName: string,
  localDestinationFolder: string, // e.g. "blog/published/images"
  gcpFolderPrefix: string = "/" // `public` or `private` (used to discriminate between public and private images in the bucket)
): Promise<string[]> => {
  const listingOptions = {
    prefix: gcpFolderPrefix,
  };
  const [images] = await storage.bucket(gcpBucketName).getFiles(listingOptions);
  const imagesGcpBucketFilesNames: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    // if any images, populate the local filesystem in the blog's relevant folder with the images from the GCP bucket unless they already exist locally (for now let's not compare images to update them)
    const destFileOptions = {
      destination: `${localDestinationFolder}/${image.name.replace(
        gcpFolderPrefix + "/",
        ""
      )}`,
    };
    imagesGcpBucketFilesNames.push(image.name);
    if (!fs.existsSync(destFileOptions.destination)) {
      await storage
        .bucket(gcpBucketName)
        .file(image.name)
        .download(destFileOptions);
    }
  }
  return imagesGcpBucketFilesNames;
};

export default downloadImages;
