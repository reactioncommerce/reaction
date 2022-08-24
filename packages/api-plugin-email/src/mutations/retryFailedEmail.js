import Logger from "@reactioncommerce/logger";

/**
 * @name emails/retryFailed
 * @summary Retry a failed or cancelled email job
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {String} input.jobId - a sendEmail job ID
 * @returns {Boolean} - returns true if job is successfully restarted
 */
export default async function retryFailed(context, input) {
  const { collections, backgroundJobs } = context;
  const { Emails } = collections;
  const { jobId, shopId } = input;
  let emailJobId = jobId;

  await context.validatePermissions("reaction:legacy:emails", "send", {
    shopId
  });

  Logger.debug(`emails/retryFailed - restarting email job "${jobId}"`);

  // Get email job to retry
  const job = await backgroundJobs.getJob(jobId);

  // If this job was never completed, restart it and set it to "ready"
  if (job._doc.status !== "completed") {
    await job.restart();
    await job.ready();
  } else {
    // Otherwise rerun the completed job
    // `rerun` clones the job and returns the id.
    // We'll set the new one to ready
    emailJobId = job.rerun();
  }

  // Set the job status to ready to trigger the Jobs observer to trigger sendEmail
  Emails.update({ _id: emailJobId }, {
    $set: {
      status: "ready",
      updatedAt: new Date()
    }
  });

  return true;
}
