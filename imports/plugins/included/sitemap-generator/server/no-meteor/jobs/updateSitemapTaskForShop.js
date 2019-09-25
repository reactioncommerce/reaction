import Logger from "@reactioncommerce/logger";

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

  // First cancel existing job for this shop. We can't use `cancelRepeats` option
  // on `scheduleJob` because that cancels all of that type, whereas we want to
  // cancel only those with the same type AND the same shopId.
  await context.backgroundJobs.cancelJobs({
    type: jobType,
    data: { shopId }
  });

  await context.backgroundJobs.scheduleJob({
    type: jobType,
    data: { shopId },
    retry: {
      retries: 5,
      wait: 60000,
      backoff: "exponential"
    },
    schedule: sitemapRefreshPeriod
  });
}
