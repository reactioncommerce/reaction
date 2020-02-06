import Logger from "@reactioncommerce/logger";

/**
 * @summary Given a new order, sends appropriate notifications to all interested parties.
 * @param {Object} context App context
 * @param {Object} context.collections Map of MongoDB collections
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function sendNewOrderNotifications(context, order) {
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
      type: "newOrder",
      url: `${shop.slug ? `/${shop.slug}` : ""}/notifications`
    }).catch((error) => {
      Logger.error("Error in createNotification within sendNewOrderNotifications", error);
    });
  }

  // TODO: Send notification to all who want to know about new orders coming in for this shop.
  // First we need to add a way to add accounts to a list of people who want to be notified about
  // all new orders. Then call this for each account:
  //
  // context.mutations.createNotification(context, {
  //   accountId,
  //   type: "forAdmin",
  //   url: "/operator/orders"
  // });
}
