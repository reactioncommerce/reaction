import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "/imports/plugins/included/job-queue/server/no-meteor/jobs";
import generateSitemaps from "../lib/generate-sitemaps";

const jobType = "sitemaps/generate";

/**
 * @name generateSitemapsJob
 * @summary Initializes and processes a job that regenerates XML sitemaps
 * @param {Object} context App context
 * @returns {undefined}
 */
export default function generateSitemapsJob(context) {
  const { appEvents, collections: { Packages, Shops } } = context;

  // Hook that schedules job
  appEvents.on("afterCoreInit", async () => {
    const shops = await Shops.find({}, { projection: { _id: 1 } }).toArray();

    // Add one sitemap job per shop
    shops.forEach(async (shop) => {
      const corePkg = await Packages.findOne({ name: "core", shopId: shop._id });
      const sitemaps = corePkg && corePkg.settings && corePkg.settings.sitemaps;
      const refreshPeriod = (sitemaps && sitemaps.refreshPeriod) || "every 24 hours";

      Logger.debug(`Adding ${jobType} to JobControl. Refresh ${refreshPeriod}`);

      new Job(Jobs, jobType, { shopId: shop._id })
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
  });

  // Function that processes job
  const sitemapGenerationJob = Jobs.processJobs(jobType, {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 180 * 1000
  }, async (job, callback) => {
    Logger.debug(`Processing ${jobType} job`);

    const { notifyUserId = "", shopId } = job.data;
    await generateSitemaps(context, { notifyUserId, shopIds: [shopId] });

    const doneMessage = `${jobType} job done`;
    Logger.debug(doneMessage);
    job.done(doneMessage, { repeatId: true });
    callback();
  });

  // Observer that triggers processing of job when ready
  Jobs.events.on("ready", () => {
    Jobs.find({
      type: jobType,
      status: "ready"
    }).observe({
      added() {
        return sitemapGenerationJob.trigger();
      }
    });
  });
}
