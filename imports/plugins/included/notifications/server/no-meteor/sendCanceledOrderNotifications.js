import Logger from "@reactioncommerce/logger";
import createNotification from "./createNotification";
import getShopPrefix from "./getShopPrefix";

/**
 * @summary Given a canceled order, sends appropriate notifications to all interested parties.
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function sendCanceledOrderNotifications(collections, order) {
  // Send notification to user who made the order
  if (order.accountId) {
    const prefix = await getShopPrefix(collections, order.shopId);
    createNotification(collections, {
      accountId: order.accountId,
      type: "orderCanceled",
      url: `${prefix}/notifications`
    }).catch((error) => {
      Logger.error("Error in createNotification within sendCanceledOrderNotifications", error);
    });
  }
}
