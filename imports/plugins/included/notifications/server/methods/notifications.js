import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Notifications, Packages } from "/lib/collections";

/**
 * @file Methods for Notifications. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Notification/Methods
*/
Meteor.methods({
  /**
  * @name notification/send
  * @memberof Notification/Methods
  * @method
  * @summary This send a notification to an account
  * @param {String} accountId - The account to notify
  * @param {String} type - The type of Notification
  * @param {String} url - url link
  * @param {Boolean} sms - sms enabled check.
  * @param {String} details - details of the Notification
  * @return {Object} returns result
  */
  "notification/send"(accountId, type, url, sms, details) {
    check(accountId, String);
    check(type, String);
    check(url, String);
    check(sms, Boolean);
    check(details, Match.OptionalOrNull(String));

    const values = {};
    const types = {
      orderCanceled: "Your order was canceled.",
      newOrder: "Your order was accepted",
      forAdmin: "You have a new order.",
      orderDelivered: "Your order has been delivered.",
      orderProcessing: "Your order is being processed.",
      orderShipped: "Your order has been shipped."
    };

    if (accountId && type && url) {
      values.type = type;
      values.to = accountId;
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
        Meteor.call("sms/send", values.message, accountId, Reaction.getShopId(), (error) => {
          if (error) {
            Logger.warn("Error: error occured while sending sms", error);
          }
        });
      } else {
        Logger.debug("Sms is not enabled");
      }
    }
    Logger.debug(`Sending notification to account ${accountId}`);
    return Notifications.insert(values);
  },

  /**
   * @name notification/markOneAsRead
   * @memberof Notification/Methods
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
   * @memberof Notification/Methods
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
