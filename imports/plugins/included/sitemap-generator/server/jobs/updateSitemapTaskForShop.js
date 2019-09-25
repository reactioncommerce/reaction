import Logger from "@reactioncommerce/logger";
import { Job, Jobs } from "/imports/plugins/included/job-queue/server/no-meteor/jobs";

const jobType = "sitemaps/generate";

/**
 * @summary Schedules a job to update sitemaps for one shop, canceling any existing job of this type.
 * @param {Object} context App context
 * @param {String} shopId ID of the shop to update sitemaps for
 * @return {Promise<undefined>} Nothing
 */
export default async function updateSitemapTaskForShop(context, shopId) {
  const { sitemapRefreshPeriod } = await context.queries.appSettings(context, shopId);

  Logger.debug(`Adding ${jobType} job for shop ${shopId}. Refresh ${sitemapRefreshPeriod}`);

  new Job(Jobs, jobType, { shopId })
    .retry({
      retries: 5,
      wait: 60000,
      backoff: "exponential"
    })
    .repeat({
      schedule: Jobs.later.parse.text(sitemapRefreshPeriod)
    })
    .save({
      cancelRepeats: true
    });
}
