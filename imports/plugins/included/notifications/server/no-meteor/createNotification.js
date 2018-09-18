import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Notification as NotificationSchema } from "/imports/collections/schemas";
import appEvents from "/imports/node-app/core/util/appEvents";

const messageForType = {
  orderCanceled: "Your order was canceled.",
  newOrder: "Your order was accepted",
  forAdmin: "You have a new order.",
  orderDelivered: "Your order has been delivered.",
  orderProcessing: "Your order is being processed.",
  orderShipped: "Your order has been shipped."
};

/**
 * @method
 * @summary Create a notification to an account
 * @param {Object} collections - Map of MongoDB collections
 * @param {String} input.accountId - The account to notify
 * @param {String} input.details - details of the Notification
 * @param {String} input.type - The type of Notification
 * @param {String} input.url - url link
 * @return {undefined}
 */
export default async function createNotification(collections, { accountId, details, type, url }) {
  const doc = {
    _id: Random.id(),
    details,
    hasDetails: !!details,
    message: messageForType[type],
    status: "unread",
    timeSent: new Date(),
    to: accountId,
    type,
    url
  };

  NotificationSchema.validate(doc);
  await collections.Notifications.insertOne(doc);

  // Email or SMS plugins can watch for this event to send
  appEvents.emit("afterNotificationCreate", doc).catch((error) => {
    Logger.error("Error emitting afterNotificationCreate in createNotification", error);
  });
}
