import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Notifications } from "/lib/collections";

/**
 * Notification list publication
 * @param {String} userId
 * @returns {Object} return notification cursor
 */
Meteor.publish("Notification", function (userId) {
  check(userId, Match.OptionalOrNull(String));

  if (!userId) {
    Logger.debug("Ignoring null request on Notification Subscription");
    return this.ready();
  }

  const result = Notifications.find({ to: userId });

  return result;
});
