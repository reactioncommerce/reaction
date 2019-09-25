/**
 * @method createSaveImageJob
 * @summary Creates a new Job to convert an image
 * @param {Object} context App context
 * @param {Object} doc - The inserted doc containing the relevant data.
 * @param {String} collectionName - The reference to the FileCollection that document was inserted in.
 * @param {Boolean} isRemote - The reference to the FileCollection that document was inserted in.
 * @return {undefined}
 */
export default async function createSaveImageJob(context, doc, collectionName, isRemote = false) {
  const recordType = isRemote ? "remote" : "local";

  context.backgroundJobs.scheduleJob({
    data: { doc, collectionName },
    priority: "normal",
    retry: {
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    },
    type: `saveImage/${recordType}`
  });
}
