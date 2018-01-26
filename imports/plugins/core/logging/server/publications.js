import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Logs } from "/lib/collections";
import { Reaction } from "/server/api";


/**
 * Publish logs
 * Poor admins get swamped with a ton of data so let's just only subscribe to one
 * logType at a time
 */
Meteor.publish("Logs", function (query, options) {
  check(query, Match.OneOf(undefined, Object));
  check(options, Match.OneOf(undefined, Object));

  const shopId = Reaction.getShopId();
  if (!query || !query.logType || !shopId) {
    return this.ready();
  }

  const { logType } = query;
  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    Counts.publish(this, "logs-count", Logs.find({ shopId, logType }));
    return Logs.find({ shopId, logType }, { sort: { date: 1 } });
  }
});
