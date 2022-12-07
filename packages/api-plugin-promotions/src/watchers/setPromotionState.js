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
  const { appEvents, collections: { Promotions } } = context;
  const shopTimes = await getCurrentShopTime(context);
  let totalUpdated = 0;
  for (const shop of Object.keys(shopTimes)) {
    const shopTime = shopTimes[shop];
    // eslint-disable-next-line no-await-in-loop
    const toMarkActive = await Promotions.find({
      shopId: shop,
      state: "created",
      enabled: true,
      startDate: { $lte: shopTime },
      $or: [
        { endDate: { $gt: shopTime } },
        { endDate: null }
      ]
    }).toArray();
    for (const promotion of toMarkActive) {
      const { modifiedCount } = Promotions.updateOne({ _id: promotion._id }, { $set: { state: "active" } });
      if (modifiedCount === 1) {
        appEvents.emit("promotionActivated", promotion);
        totalUpdated += 1;
      } else {
        Logger.error({ promotionId: promotion._id, ...logCtx }, "Error updating promotion record to active");
      }
    }
  }
  return totalUpdated;
}

/**
 * @summary mark all promotion records that have just come out of their window as completed
 * @param {Object} context - The application context
 * @return {Promise<number>} - The total number of records updated
 */
async function markCompleted(context) {
  const { appEvents, collections: { Promotions } } = context;
  const shopTimes = await getCurrentShopTime(context);
  let totalUpdated = 0;
  for (const shop of Object.keys(shopTimes)) {
    const shopTime = shopTimes[shop];
    // eslint-disable-next-line no-await-in-loop
    const toMarkCompleted = await Promotions.find({
      shopId: shop,
      state: "active",
      endDate: { $lt: shopTime }
    }).toArray();
    for (const promotion of toMarkCompleted) {
      const { modifiedCount } = Promotions.updateOne({ _id: promotion._id }, { $set: { state: "completed" } });
      if (modifiedCount === 1) {
        appEvents.emit("promotionCompleted", promotion);
        totalUpdated += 1;
      } else {
        Logger.error({ promotionId: promotion._id, ...logCtx }, "Error updating promotion record to completed");
      }
    }
  }
  return totalUpdated;
}

/**
 * @summary return closure of markPromotion states with context enclosed
 * @param {Object} context - The application context
 * @return {Function} - markPromotionsStates function with context enclosed
 */
export default function setPromotionState(context) {
  /**
   * @summary scan all promotions for any that need to change state
   * @return {Promise<Object|Number>} - Either an object of completed record counts, or error
   */
  async function markPromotionStates() {
    return new Promise(async (resolve, reject) => {
      try {
        const totalMadeActive = await markActive(context);
        const totalMarkedCompleted = await markCompleted(context);
        Logger.info({ ...logCtx, totalMarkedCompleted, totalMadeActive }, "Scanned promotions for changing state");
        resolve({ totalMarkedCompleted, totalMadeActive });
      } catch (error) {
        reject(error);
      }
    });
  }
  return markPromotionStates;
}
