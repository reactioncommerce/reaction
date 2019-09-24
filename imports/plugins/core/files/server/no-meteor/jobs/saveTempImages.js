import Logger from "@reactioncommerce/logger";
import { Jobs } from "/imports/plugins/included/job-queue/server/no-meteor/jobs";

/**
 * @method saveTempImages
 * @summary Processes the Jobs to convert an remote image
 * @param {Object} fileWorker - The created instance of TempFileStoreWorker
 * @return {undefined}
 */
export default function saveTempImages(fileWorker) {
  const saveImagesJob = Jobs.processJobs("saveImage/local", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 10 * 60 * 1000, // No image import should last more than 10 minutes
    concurrency: 1, // Only run one at a time
    prefetch: 0 // Don't prefetch
  }, async (job, callback) => {
    Logger.debug("saveImage/local: started");

    const { data } = job;
    const { doc } = data;
    try {
      const { collectionName } = data;
      await fileWorker.addDocumentByCollectionName(doc, collectionName);
      job.done(`Finished converting temporary image from ${doc._id}`);
    } catch (error) {
      job.fail(`Failed to convert temporary image from ${doc._id}. Error: ${error}`);
    }

    callback();
    Logger.debug("saveImage/local: finished");
  });

  // Observer that triggers processing of job when ready
  Jobs.whenReady(() => {
    Jobs.find({
      type: "saveImage/local",
      status: "ready"
    }).observe({
      added() {
        return saveImagesJob.trigger();
      }
    });
  });
}
