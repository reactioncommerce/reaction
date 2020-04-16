/**
 * @method saveRemoteImages
 * @summary Processes the Jobs to convert a remote image
 * @param {Object} context App context
 * @param {Object} remoteUrlWorker - The created instance of RemoteUrlWorker
 * @return {undefined}
 */
export default function saveRemoteImages(context, remoteUrlWorker) {
  context.backgroundJobs.addWorker({
    type: "saveImage/remote",
    pollInterval: 3 * 1000, // poll every 3 seconds
    workTimeout: 10 * 60 * 1000, // No image import should last more than 10 minutes
    async worker(job) {
      const { collectionName, doc } = job.data;
      try {
        await remoteUrlWorker.addDocumentByCollectionName(doc, collectionName);
        job.done(`Finished converting remote image from ${doc._id}`);
      } catch (error) {
        job.fail(`Failed to convert remote image from ${doc._id}. Error: ${error}`);
      }
    }
  });
}
