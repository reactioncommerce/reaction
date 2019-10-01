import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";

/**
 * @name email/retryFailed
 * @method
 * @summary Retry a failed or cancelled email job
 * @memberof Email/Methods
 * @param {String} jobId - a sendEmail job ID
 * @returns {Boolean} - returns true if job is successfully restarted
 */
export default function retryFailed(jobId) {
  check(jobId, String);

  const userId = Reaction.getUserId();
  if (!Reaction.hasPermission(["owner", "admin", "reaction-email"], userId, Reaction.getPrimaryShopId())) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  Logger.debug(`emails/retryFailed - restarting email job "${jobId}"`);

  // Get email job to retry
  const context = Promise.await(getGraphQLContextInMeteorMethod(userId));
  const job = Promise.await(context.backgroundJobs.getJob(jobId));
  Promise.await(job.restart());
  Promise.await(job.ready());

  return true;
}
