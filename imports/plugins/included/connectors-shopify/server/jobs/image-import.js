import { FileRecord } from "@reactioncommerce/file-collections";
import { Jobs } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";
import fetch from "node-fetch";

async function addMediaFromUrl({ url, metadata }) {
  const fileRecord = await FileRecord.fromUrl(url, { fetch });

  // Set workflow to "published" to bypass revision control on insert for this image.
  fileRecord.metadata = { ...metadata, workflow: "published" };

  return Media.insert(fileRecord);
}

export const importImages = () => {
  Jobs.processJobs("connectors/shopify/import/image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 5 * 1000 // No image import should last more than 5 seconds
  }, (job, callback) => {
    const { data } = job;
    const { url } = data;
    try {
      Promise.await(addMediaFromUrl(data));
      job.done(`Finished importing image from ${url}`);
      callback();
    } catch (error) {
      job.fail(`Failed to import image from ${url}.`);
      callback();
    }
  });
};
