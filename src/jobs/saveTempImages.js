/**
 * @method saveTempImages
 * @summary Processes the Jobs to convert a local image
 * @param {Object} context App context
 * @param {Object} fileWorker - The created instance of TempFileStoreWorker
 * @return {undefined}
 */
export default function saveTempImages(context, fileWorker) {
  context.backgroundJobs.addWorker({
    type: "saveImage/local",
    pollInterval: 3 * 1000, // poll every 3 seconds
    workTimeout: 10 * 60 * 1000, // No image import should last more than 10 minutes
    async worker(job) {
      const { collectionName, doc } = job.data;
      try {
        await fileWorker.addDocumentByCollectionName(doc, collectionName);
        job.done(`Finished converting temporary image from ${doc._id}`);
      } catch (error) {
        job.fail(`Failed to convert temporary image from ${doc._id}. Error: ${error}`);
      }
    }
  });
}
