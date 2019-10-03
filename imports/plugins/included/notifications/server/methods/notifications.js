import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import rawCollections from "/imports/collections/rawCollections";

/**
 * @method
 * @summary Update a notification's status to "read"
 * @param {String} id - The notification ID
 * @returns {undefined}
 */
async function markNotificationRead(id) {
  const { matchedCount } = await rawCollections.Notifications.updateOne({ _id: id }, {
    $set: {
      status: "read"
    }
  });
  if (matchedCount !== 1) throw new ReactionError("server-error", "Unable to mark notification read");
}

/**
 * @file Methods for Notifications. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Notification/Methods
*/
Meteor.methods({
  /**
   * @name notification/markOneAsRead
   * @memberof Notification/Methods
   * @method
   * @summary This marks a user's notification as "read"
   * @param {String} id - The notification ID
   * @returns {Object} returns cursor
   */
  "notification/markOneAsRead": (id) => {
    check(id, String);

    return markNotificationRead(id);
  }
});
