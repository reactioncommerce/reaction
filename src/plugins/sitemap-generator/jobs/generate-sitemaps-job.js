import generateSitemaps from "../util/generate-sitemaps.js";
import updateSitemapTaskForShop from "./updateSitemapTaskForShop.js";

const jobType = "sitemaps/generate";

/**
 * @name generateSitemapsJob
 * @summary Initializes and processes a job that regenerates XML sitemaps
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function generateSitemapsJob(context) {
  const { collections: { Shops } } = context;

  await context.backgroundJobs.addWorker({
    type: jobType,
    workTimeout: 180 * 1000,
    async worker(job) {
      const { notifyUserId = "", shopId } = job.data;

      try {
        await generateSitemaps(context, { notifyUserId, shopIds: [shopId] });
        job.done(`${jobType} job done`, { repeatId: true });
      } catch (error) {
        job.fail(`Failed to generate sitemap. Error: ${error}`);
      }
    }
  });

  // Add one sitemap job per shop
  const shops = await Shops.find({}, { projection: { _id: 1, name: 1 } }).toArray();
  const promises = shops.map((shop) => updateSitemapTaskForShop(context, shop._id));
  await Promise.all(promises);
}
