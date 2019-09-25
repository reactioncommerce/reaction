import Logger from "@reactioncommerce/logger";
import { Jobs } from "/imports/plugins/included/job-queue/server/no-meteor/jobs";
import generateSitemaps from "../lib/generate-sitemaps";
import updateSitemapTaskForShop from "./updateSitemapTaskForShop";

const jobType = "sitemaps/generate";

/**
 * @name generateSitemapsJob
 * @summary Initializes and processes a job that regenerates XML sitemaps
 * @param {Object} context App context
 * @returns {undefined}
 */
export default function generateSitemapsJob(context) {
  const { collections: { Shops } } = context;

  Jobs.whenReady(async () => {
    // Register the worker function
    const sitemapGenerationJob = Jobs.processJobs(jobType, {
      pollInterval: 60 * 60 * 1000, // backup polling, see observer below
      workTimeout: 180 * 1000
    }, async (job, callback) => {
      Logger.debug(`${jobType}: started`);

      const { notifyUserId = "", shopId } = job.data;

      try {
        await generateSitemaps(context, { notifyUserId, shopIds: [shopId] });
        job.done(`${jobType} job done`, { repeatId: true });
      } catch (error) {
        job.fail(`Failed to generate sitemap. Error: ${error}`);
      }

      callback();
      Logger.debug(`${jobType}: finished`);
    });

    // Watch database for jobs of this type that are ready, and call the worker function
    Jobs.find({
      type: jobType,
      status: "ready"
    }).observe({
      added() {
        return sitemapGenerationJob.trigger();
      }
    });

    // Add one sitemap job per shop
    const shops = await Shops.find({}, { projection: { _id: 1, name: 1 } }).toArray();
    const promises = shops.map((shop) => updateSitemapTaskForShop(context, shop._id));
    await Promise.all(promises);
  });
}
