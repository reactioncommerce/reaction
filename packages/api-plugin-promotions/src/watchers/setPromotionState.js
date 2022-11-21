import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import getCurrentShopTime from "../utils/getCurrentShopTime.js";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/setPromotionState.js"
};

/**
 * @summary mark all promotion records that have just come into their window as active
 * @param {Object} context - The application context
 * @return {Promise<number>} - The total number of records updated
 */
async function markActive(context) {
  const { collections: { Promotions } } = context;
  const shopTimes = await getCurrentShopTime(context);
  let totalUpdated = 0;
  for (const shop of Object.keys(shopTimes)) {
    const shopTime = shopTimes[shop];
    // eslint-disable-next-line no-await-in-loop
    const { modifiedCount } = await Promotions.updateMany({
      shopId: shop,
      state: "created",
      enabled: true,
      startDate: { $lte: shopTime },
      $or: [
        { endDate: { $gt: shopTime } },
        { endDate: null }
      ]
    }, { $set: { state: "active" } });
    totalUpdated += modifiedCount;
  }
  return totalUpdated;
}

/**
 * @summary mark all promotion records that have just come out of their window as completed
 * @param {Object} context - The application context
 * @return {Promise<number>} - The total number of records updated
 */
async function markCompleted(context) {
  const { collections: { Promotions } } = context;
  const shopTimes = await getCurrentShopTime(context);
  let totalUpdated = 0;
  for (const shop of Object.keys(shopTimes)) {
    const shopTime = shopTimes[shop];
    // eslint-disable-next-line no-await-in-loop
    const { modifiedCount } = await Promotions.updateMany({
      shopId: shop,
      state: "active",
      endDate: { $lt: shopTime }
    }, { $set: { state: "completed" } });
    totalUpdated += modifiedCount;
  }
  return totalUpdated;
}

/**
 * @summary capture and change all promotion records who's state should have changed
 * @param {Object} context - The application context
 * @return {Promise<Object>} - quantities marked active and completed
 */
export default async function setPromotionState(context) {
  const totalMadeActive = await markActive(context);
  const totalMarkedCompleted = await markCompleted(context);
  Logger.info({ ...logCtx, totalMarkedCompleted, totalMadeActive }, "Scanned promotions for changing state");
  return { totalMarkedCompleted, totalMadeActive };
}
