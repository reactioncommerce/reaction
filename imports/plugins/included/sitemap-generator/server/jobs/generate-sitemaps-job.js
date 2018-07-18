import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Jobs } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Job } from "/imports/plugins/core/job-collection/lib";
import generateSitemaps from "../lib/generate-sitemaps";

/**
 * @name generateSitemapsJob
 * @summary Initializes and processes a job that regenerates XML sitemaps
 * @returns {undefined}
 */
export default function generateSitemapsJob() {
  const jobId = "sitemaps/generate";

  // Hook that schedules job
  Hooks.Events.add("afterCoreInit", () => {
    const settings = Reaction.getShopSettings();
    const { sitemaps } = settings;
    const refreshPeriod = (sitemaps && sitemaps.refreshPeriod) || "every 24 hours";

    Logger.debug(`Adding ${jobId} to JobControl. Refresh ${refreshPeriod}`);

    new Job(Jobs, jobId, {})
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential"
      })
      .repeat({
        schedule: Jobs.later.parse.text(refreshPeriod)
      })
      .save({
        cancelRepeats: true
      });
  });

  // Function that processes job
  const sitemapGenerationJob = Jobs.processJobs(jobId, {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, (job, callback) => {
    Logger.debug(`Processing ${jobId} job`);
    generateSitemaps();
    const doneMessage = `${jobId} job done`;
    Logger.debug(doneMessage);
    job.done(doneMessage, { repeatId: true });
    callback();
  });

  // Observer that triggers processing of job when ready
  Jobs.find({
    type: jobId,
    status: "ready"
  }).observe({
    added() {
      return sitemapGenerationJob.trigger();
    }
  });
}
