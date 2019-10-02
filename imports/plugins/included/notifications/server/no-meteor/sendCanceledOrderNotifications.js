import Logger from "@reactioncommerce/logger";
import createNotification from "./createNotification";

/**
 * @summary Given a canceled order, sends appropriate notifications to all interested parties.
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function sendCanceledOrderNotifications(collections, order) {
  // Send notification to user who made the order
  if (order.accountId) {
    const shop = await collections.Shops.findOne({
      _id: order.shopId
    }, {
      projection: {
        slug: 1
      }
    });

    createNotification(collections, {
      accountId: order.accountId,
      type: "orderCanceled",
      url: `${shop.slug ? `/${shop.slug}` : ""}/notifications`
    }).catch((error) => {
      Logger.error("Error in createNotification within sendCanceledOrderNotifications", error);
    });
  }
}
