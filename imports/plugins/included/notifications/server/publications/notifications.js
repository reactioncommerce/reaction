import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Logger } from "/server/api";
import { Notifications } from "/lib/collections";

/**
 * Notification list publication
 * @param {String} userId
 * @return {Object} return notification cursor
 */
Meteor.publish("Notification", function (userId) {
  check(userId, Match.OptionalOrNull(String));

  if (!userId) {
    Logger.debug("Ingnoring null request on Notification Subscription");
    return this.ready();
  }

  const result = Notifications.find({ to: userId });

  return result;
});
