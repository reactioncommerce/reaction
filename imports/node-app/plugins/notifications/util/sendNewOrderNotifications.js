import Logger from "@reactioncommerce/logger";

/**
 * @summary Sends a new order notification to an admin
 * @param {Object} context App context
 * @param {Object} context.collections Map of MongoDB collections
 * @param {String} adminUserId User ID (not account ID)
 * @returns {undefined}
 */
async function sendNotificationToAdmin(context, adminUserId) {
  const { collections: { Accounts } } = context;

  const account = await Accounts.findOne({ userId: adminUserId }, { projection: { _id: 1 } });
  if (!account) {
    throw new Error(`No account found for admin user ID ${adminUserId}`);
  }

  return context.mutations.createNotification(context, {
    accountId: account._id,
    type: "forAdmin",
    url: "/operator/orders"
  });
}

/**
 * @summary Given a new order, sends appropriate notifications to all interested parties.
 * @param {Object} context App context
 * @param {Object} context.collections Map of MongoDB collections
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function sendNewOrderNotifications(context, order) {
  const { collections: { Shops, users } } = context;

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

  // Send notification to all who have "owner" role for each shop that has items to fulfill
  const ownersByShop = {};
  const promises = order.shipping.map(async ({ shopId }) => {
    ownersByShop[shopId] = await users.find({ [`roles.${shopId}`]: "owner" }, {
      projection: {
        _id: 1
      }
    }).toArray();
  });
  await Promise.all(promises);

  Object.keys(ownersByShop).forEach((shopId) => {
    ownersByShop[shopId].forEach((user) => {
      sendNotificationToAdmin(context, user._id, shopId).catch((error) => {
        Logger.error("Error in sendNotificationToAdmin within sendNewOrderNotifications", error);
      });
    });
  });
}
