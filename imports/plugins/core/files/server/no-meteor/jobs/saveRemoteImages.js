import { Jobs } from "/imports/plugins/included/job-queue/server/no-meteor/jobs";

/**
 * @method saveRemoteImages
 * @summary Processes the Jobs to convert an remote image
 * @param {Object} remoteUrlWorker - The created instance of RemoteUrlWorker
 * @return {undefined}
 */
export default function saveRemoteImages(remoteUrlWorker) {
  const saveImagesJob = Jobs.processJobs("saveImage/remote", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 10 * 60 * 1000, // No image import should last more than 10 minutes
    concurrency: 1, // Only run one at a time
    prefetch: 0 // Don't prefetch
  }, async (job, callback) => {
    const { data } = job;
    const { doc } = data;
    try {
      const { collectionName } = data;
      await remoteUrlWorker.addDocumentByCollectionName(doc, collectionName);
      job.done(`Finished converting remote image from ${doc._id}`);
      callback();
    } catch (error) {
      job.fail(`Failed to convert remote image from ${doc._id}. Error: ${error}`);
      callback();
    }
  });

  // Observer that triggers processing of job when ready
  Jobs.events.on("ready", () => {
    Jobs.find({
      type: "saveImage/remote",
      status: "ready"
    }).observe({
      added() {
        return saveImagesJob.trigger();
      }
    });
  });
}
