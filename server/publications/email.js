import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Roles } from "meteor/alanning:roles";
import { Jobs } from "/lib/collections";

/**
 * Email Job Logs
 * @type {Object} options - standard publication options object
 */
Meteor.publish("Emails", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  if (Roles.userIsInRole(this.userId, ["owner", "admin", "dashboard"])) {
    Counts.publish(this, "emails-count", Jobs.find({ type: "sendEmail" }));
    return Jobs.find({ type: "sendEmail" });
  }

  return this.ready();
});
