import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";


/**
 * @name processJobItems
 * @summary Searches for jobItems and processes them
 * @return {undefined}
 */
async function processJobItems() {
  // Loop through each conversionMap collection
  // Check if there is pending import or export for each collection
  // If not, look for an import or export to process
  // In other words, there should only be one jobItem in progress per collection at a time
  return;
}

/**
 * @name generateProcessJobItemsJob
 * @summary Generate the job that processes jobItems
 * @return {undefined}
 */
export default function generateProcessJobItemsJob() {
  const jobId = "csvConnector/processJobItems";

  Hooks.Events.add("afterCoreInit", () => {
    new Job(Jobs, jobId, {})
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .repeat({
        schedule: Jobs.later.parse.text("every 1 min")
      })
      .save({
        cancelRepeats: true
      });
  });

  const processJobItemJob = Jobs.processJobs(jobId, {
    pollInterval: 30 * 1000, // backup polling, see observer below
    workTimeout: 60 * 60 * 1000
  }, (job, callback) => {
    Logger.info(`Processing ${jobId} job`);
    processJobItems();
    const doneMessage = `${jobId} job done`;
    Logger.info(doneMessage);
    job.done(doneMessage, { repeatId: true });
    callback();
  });

  // Observer that triggers processing of job when ready
  Jobs.find({
    type: jobId,
    status: "ready"
  }).observe({
    added() {
      return processJobItemJob.trigger();
    }
  });
}
