import { Jobs } from "/imports/utils/jobs";

/**
 * @method convertTempImages
 * @summary Processes the Jobs to convert an remote image
 * @param {Object} fileWorker - The created instance of TempFileStoreWorker
 * @return {undefined}
 */
export default function convertTempImages(fileWorker) {
  const convertImagesJob = Jobs.processJobs("convertImage/local", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 600 * 1000, // No image import should last more than 10 minutes
    concurrency: 1, // Only run one at a time
    prefetch: 0 // Don't prefetch
  }, async (job, callback) => {
    const { data } = job;
    const { doc } = data;
    try {
      const { collectionName } = data;
      await fileWorker.addDocumentByCollectionName(doc, collectionName);
      job.done(`Finished converting temporary image from ${doc._id}`);
      callback();
    } catch (error) {
      job.fail(`Failed to convert temporary image from ${doc._id}. Error: ${error}`);
      callback();
    }
  });

  // Observer that triggers processing of job when ready
  Jobs.find({
    type: "convertImage/local",
    status: "ready"
  }).observe({
    added() {
      return convertImagesJob.trigger();
    }
  });
}
