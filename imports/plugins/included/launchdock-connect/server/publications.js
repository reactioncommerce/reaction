import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";


Meteor.publish("launchdock-auth", function () {
  // only publish Launchdock credentials for logged in admin/owner
  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    return Meteor.users.find({ _id: this.userId }, {
      fields: {
        "services.launchdock.userId": 1,
        "services.launchdock.username": 1,
        "services.launchdock.auth": 1,
        "services.launchdock.url": 1,
        "services.launchdock.stackId": 1
      }
    });
  }
  return this.ready();
});
