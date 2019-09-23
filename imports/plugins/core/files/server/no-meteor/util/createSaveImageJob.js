import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "/imports/plugins/included/job-queue/server/no-meteor/jobs";

/**
 * @method createSaveImageJob
 * @summary Creates a new Job to convert an image
 * @param {Object} doc - The inserted doc containing the relevant data.
 * @param {String} collectionName - The reference to the FileCollection that document was inserted in.
 * @param {Boolean} isRemote - The reference to the FileCollection that document was inserted in.
 * @return {undefined}
 */
export default async function createSaveImageJob(doc, collectionName, isRemote = false) {
  const recordType = isRemote ? "remote" : "local";

  const duplicateJob = await Jobs.findOne({
    "type": `saveImage/${recordType}`,
    "data.doc._id": doc._id
  });

  if (duplicateJob) {
    Logger.debug("There already seems to be a job for this document, skipping");
    return;
  }

  new Job(Jobs, `saveImage/${recordType}`, { doc, collectionName })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}
