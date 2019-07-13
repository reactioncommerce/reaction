import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "/imports/utils/jobs";

/**
 * @method createConvertImageJob
 * @summary Creates a new Job to convert an image
 * @param {Object} doc - The inserted doc containing the relevant data.
 * @param {String} collectionName - The reference to the FileCollection that document was inserted in.
 * @param {Boolean} isRemote - The reference to the FileCollection that document was inserted in.
 * @return {undefined}
 */
export default async function createConvertImageJob(doc, collectionName, isRemote = false) {
  const recordType = (isRemote && "remote") || "local";

  const isDuplicateJob = await Jobs.findOne({
    "type": `convertImage/${recordType}`,
    "data.doc._id": doc._id
  });

  if (isDuplicateJob) {
    Logger.debug("There already seems to be a job for this document, skipping");
    return;
  }

  new Job(Jobs, `convertImage/${recordType}`, { doc, collectionName })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}
