import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import getCurrentShopTime from "./getCurrentShopTime.js";

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
  const shopTimes = getCurrentShopTime(context);
  let totalUpdated = 0;
  for (const shop of Object.keys(shopTimes)) {
    const shopTime = shopTimes[shop];
    // eslint-disable-next-line no-await-in-loop
    const shouldBeActive = await Promotions.find({
      state: "created",
      enabled: true,
      startDate: { $gt: shopTime },
      $or: [
        { endDate: { $lt: shopTime } },
        { endDate: null }
      ]
    }, { _id: 1 }).toArray();
    // eslint-disable-next-line no-await-in-loop
    await Promotions.update({ _id: { $in: shouldBeActive } }, { $set: { state: "active" } });
    totalUpdated += shouldBeActive;
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
  const shopTimes = getCurrentShopTime(context);
  let totalUpdated = 0;
  for (const shop of Object.keys(shopTimes)) {
    const shopTime = shopTimes[shop];
    // eslint-disable-next-line no-await-in-loop
    const shouldBeCompleted = await Promotions.find({
      state: "created",
      enabled: true,
      startDate: { $gt: shopTime },
      $or: [
        { endDate: { $lt: shopTime } },
        { endDate: null }
      ]
    }, { _id: 1 }).toArray();
    // eslint-disable-next-line no-await-in-loop
    await Promotions.update({ _id: { $in: shouldBeCompleted } }, { $set: { state: "completed" } });
    totalUpdated += shouldBeCompleted.length;
  }
  return totalUpdated;
}

/**
 * @summary capture and change all promotion records who's state should have changed
 * @param {Object} context - The application context
 * @param {Object} jobData - extra data from the job control package
 * @return {Promise<void>} - undefined
 */
export default async function setPromotionState(context, jobData) {
  Logger.info(jobData);
  const totalMadeActive = await markActive(context);
  const totalMarkedCompleted = await markCompleted(context);
  Logger.info({ ...logCtx, totalMarkedCompleted, totalMadeActive }, "Scanned promotions for changing state");
}
