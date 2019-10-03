import Logger from "@reactioncommerce/logger";

/**
 * @summary Given a canceled order, sends appropriate notifications to all interested parties.
 * @param {Object} context App context
 * @param {Object} context.collections Map of MongoDB collections
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function sendCanceledOrderNotifications(context, order) {
  const { collections: { Shops } } = context;

  // Send notification to user who made the order
  if (order.accountId) {
    const shop = await Shops.findOne({
      _id: order.shopId
    }, {
      projection: {
        slug: 1
      }
    });

    context.mutations.createNotification(context, {
      accountId: order.accountId,
      type: "orderCanceled",
      url: `${shop.slug ? `/${shop.slug}` : ""}/notifications`
    }).catch((error) => {
      Logger.error("Error in createNotification within sendCanceledOrderNotifications", error);
    });
  }
}
