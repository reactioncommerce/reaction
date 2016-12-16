import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Notifications } from "/lib/collections";
import { Logger } from "/server/api";

/**
 * Reaction Notification methods
 */
Meteor.methods({
  /**
  * notification/send
  * @summary This send a notification to a user
  * @param {String} userId - The user
  * @param {String} type - The type of Notification
  * @param {String} details - The complete details of the Notification
  * @param {String} url - The link
  * @param {Boolean} sms - To allow sms notification.
  * @return {Object} returns result
  */
  "notification/send": function (userId, type, url, sms, details) {
    check(userId, String);
    check(type, String);
    check(sms, Boolean);
    check(details, String);
    check(url, String);

    const values = {};
    const types = {
      orderCancelled: "Your order was cancelled.",
      newOrder: "Your order is being processed.",
      topWallet: "Your wallet has been credited.",
      orderDelivered: "Your order has been delivered.",
      orderAccepted: "Your order has been accepted.",
      orderShipped: "Your order has been shipped."
    };

    if (userId && type && url) {
      values.type = type;
      values.to = userId;
      values.message = types[type];

      if (details) {
        values.hasDetails = true;
        values.details = details;
      }
    }

    // Logger.info(`Sending notification to ${userId}`);
    Notifications.insert(values);
  }
});
