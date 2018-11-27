import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import rawCollections from "/imports/collections/rawCollections";
import markNotificationRead from "../no-meteor/markNotificationRead";

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
   * @return {Object} returns cursor
   */
  "notification/markOneAsRead": (id) => {
    check(id, String);

    return markNotificationRead(rawCollections, id);
  }
});
