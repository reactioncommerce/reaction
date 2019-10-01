import Logger from "@reactioncommerce/logger";
import createNotification from "./createNotification";

/**
 * @summary Sends a new order notification to an admin
 * @param {Object} collections Map of MongoDB collections
 * @param {String} adminUserId User ID (not account ID)
 * @param {String} shopId The ID of the shop this person is admin for
 * @returns {undefined}
 */
async function sendNotificationToAdmin(collections, adminUserId, shopId) {
  const account = await collections.Accounts.findOne({ userId: adminUserId }, { projection: { _id: 1 } });
  if (!account) {
    throw new Error(`No account found for admin user ID ${adminUserId}`);
  }

  return createNotification(collections, {
    accountId: account._id,
    type: "forAdmin",
    url: "/operator/orders"
  });
}

/**
 * @summary Given a new order, sends appropriate notifications to all interested parties.
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function sendNewOrderNotifications(collections, order) {
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
      type: "newOrder",
      url: `${shop.slug ? `/${shop.slug}` : ""}/notifications`
    }).catch((error) => {
      Logger.error("Error in createNotification within sendNewOrderNotifications", error);
    });
  }

  // Send notification to all who have "owner" role for each shop that has items to fulfill
  const ownersByShop = {};
  const promises = order.shipping.map(async ({ shopId }) => {
    ownersByShop[shopId] = await collections.users.find({ [`roles.${shopId}`]: "owner" }, {
      projection: {
        _id: 1
      }
    }).toArray();
  });
  await Promise.all(promises);

  Object.keys(ownersByShop).forEach((shopId) => {
    ownersByShop[shopId].forEach((user) => {
      sendNotificationToAdmin(collections, user._id, shopId).catch((error) => {
        Logger.error("Error in sendNotificationToAdmin within sendNewOrderNotifications", error);
      });
    });
  });
}
