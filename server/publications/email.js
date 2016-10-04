import { Meteor } from "meteor/meteor";
import { Jobs } from "/lib/collections";
import { Roles } from "meteor/alanning:roles";

/**
 * Email Job Logs
 * @type {Object} options - standard publication options object
 */
Meteor.publish("emailJobs", function (limit) {
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "dashboard"])) {
    check(limit, Match.Optional(Number));
    return Jobs.find({ type: "sendEmail" }, {
      sort: {
        updated: -1
      },
      limit: limit || 10
    });
  }

  return this.ready();
});
