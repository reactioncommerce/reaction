import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Notifications, Packages } from "/lib/collections";

/**
 * @file Methods for Notifications. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Methods/Notification
*/
Meteor.methods({
  /**
  * @name notification/send
  * @memberof Methods/Notification
  * @method
  * @summary This send a notification to a user
  * @param {String} userId - The user
  * @param {String} type - The type of Notification
  * @param {String} url - url link
  * @param {Boolean} sms - sms enabled check.
  * @param {String} details - details of the Notification
  * @return {Object} returns result
  */
  "notification/send"(userId, type, url, sms, details) {
    check(userId, String);
    check(type, String);
    check(sms, Boolean);
    check(details, Match.OptionalOrNull(String));
    check(url, String);

    const values = {};
    const types = {
      orderCanceled: "Your order was canceled.",
      newOrder: "Your order was accepted",
      forAdmin: "You have a new order.",
      orderDelivered: "Your order has been delivered.",
      orderProcessing: "Your order is being processed.",
      orderShipped: "Your order has been shipped."
    };

    if (userId && type && url) {
      values.type = type;
      values.to = userId;
      values.url = url;
      values.message = types[type];
      values.hasDetails = false;
      if (details) {
        values.hasDetails = true;
        values.details = details;
      }
    }

    if (sms) {
      const result = Packages.findOne({ name: "reaction-sms", shopId: Reaction.getShopId() });
      if (result && result.enabled) {
        Meteor.call("sms/send", values.message, userId, Reaction.getShopId(), (error) => {
          if (error) {
            Logger.warn("Error: error occured while sending sms", error);
          }
        });
      } else {
        Logger.debug("Sms is not enabled");
      }
    }
    Logger.debug(`Sending notification to ${userId}`);
    return Notifications.insert(values);
  },

  /**
   * @name notification/markOneAsRead
   * @memberof Methods/Notification
   * @method
   * @summary This marks all user's notification as ready
   * @param {String} id - The notification id
   * @return {Object} returns cursor
   */
  "notification/markOneAsRead": (id) => {
    check(id, String);

    return Notifications.update({ _id: id }, {
      $set: {
        status: "read"
      }
    });
  },

  /**
   * @name notification/delete
   * @memberof Methods/Notification
   * @method
   * @summary This deletes a notification
   * @param {String} id - The notification id
   * @return {Object} return cursor
   */
  "notification/delete": (id) => {
    check(id, String);

    return Notifications.remove({ _id: id });
  }
});
