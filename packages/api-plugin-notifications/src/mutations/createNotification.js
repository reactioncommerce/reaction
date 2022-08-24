import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Notification as NotificationSchema } from "../simpleSchemas.js";

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
 * @param {Object} context - App context
 * @param {String} input.accountId - The account to notify
 * @param {String} input.details - details of the Notification
 * @param {String} input.type - The type of Notification
 * @param {String} input.url - url link
 * @param {String} [input.message] - Message to send, if not already defined in messageForType
 * @returns {undefined}
 */
export default async function createNotification(context, { accountId, details, type, url, userId, message = "" }) {
  const { appEvents, collections: { Notifications } } = context;

  const doc = {
    _id: Random.id(),
    details,
    hasDetails: !!details,
    message: message || messageForType[type],
    status: "unread",
    timeSent: new Date(),
    to: accountId,
    type,
    url
  };

  NotificationSchema.validate(doc);
  await Notifications.insertOne(doc);

  // Email or SMS plugins can watch for this event to send
  appEvents.emit("afterNotificationCreate", { createdBy: userId, notification: doc }).catch((error) => {
    Logger.error("Error emitting afterNotificationCreate in createNotification", error);
  });
}
