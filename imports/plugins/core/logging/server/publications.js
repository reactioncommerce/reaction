import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Logs } from "/lib/collections";
import { Reaction } from "/server/api";


/**
 * Publish logs
 * Poor admins get swamped with a ton of data so let's just only subscribe to one
 * logType at a time
 */
Meteor.publish("Logs", function (logType) {
  check(logType, String);

  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    Counts.publish(this, "logs-count", Logs.find({shopId, logType}));
    return Logs.find({shopId, logType});
  }
});
