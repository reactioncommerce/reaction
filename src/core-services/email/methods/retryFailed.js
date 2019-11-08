import Logger from "@reactioncommerce/logger";

/**
 * @name emails/retryFailed
 * @summary Retry a failed or cancelled email job
 * @param {Object} context - an object containing the per-request state
 * @param {String} jobId - a sendEmail job ID
 * @returns {Boolean} - returns true if job is successfully restarted
 */
export default async function retryFailed(context, jobId) {
  const { checkPermissions, backgroundJobs } = context;

  const shopId = await context.queries.primaryShopId(context);

  await checkPermissions(["owner", "admin", "reaction-email"], shopId);

  Logger.debug(`emails/retryFailed - restarting email job "${jobId}"`);

  const job = Promise.await(backgroundJobs.getJob(jobId));
  Promise.await(job.restart());
  Promise.await(job.ready());

  return true;
}