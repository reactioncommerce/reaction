import Logger from "@reactioncommerce/logger";
import { check } from "meteor/check";
import { Jobs } from "/imports/utils/jobs";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name email/retryFailed
 * @method
 * @summary Retry a failed or cancelled email job
 * @memberof Email/Methods
 * @param {String} jobId - a sendEmail job ID
 * @return {Boolean} - returns true if job is successfully restarted
 */
export default function retryFailed(jobId) {
  if (!Reaction.hasPermission(["owner", "admin", "reaction-email"], this.userId, Reaction.getPrimaryShopId())) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  check(jobId, String);
  let emailJobId = jobId;

  Logger.debug(`emails/retryFailed - restarting email job "${jobId}"`);

  // Get email job to retry
  const job = Jobs.getJob(jobId);
  // If this job was never completed, restart it and set it to "ready"
  if (job._doc.status !== "completed") {
    job.restart();
    job.ready();
  } else {
    // Otherwise rerun the completed job
    // `rerun` clones the job and returns the id.
    // We'll set the new one to ready
    emailJobId = job.rerun(); // Clone job to rerun
  }

  // Set the job status to ready to trigger the Jobs observer to trigger sendEmail
  Jobs.update({ _id: emailJobId }, {
    $set: {
      status: "ready"
    }
  });

  return true;
}
