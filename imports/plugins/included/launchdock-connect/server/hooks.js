import { Meteor } from "meteor/meteor";
import { Hooks, Logger } from "/server/api";

/**
 * Hook to setup default admin user with Launchdock credentials (if they exist)
 */

Hooks.Events.add("afterCreateDefaultAdminUser", (user) => {
  if (process.env.LAUNCHDOCK_USERID) {
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        "services.launchdock.userId": process.env.LAUNCHDOCK_USERID,
        "services.launchdock.username": process.env.LAUNCHDOCK_USERNAME,
        "services.launchdock.auth": process.env.LAUNCHDOCK_AUTH,
        "services.launchdock.url": process.env.LAUNCHDOCK_URL,
        "services.launchdock.stackId": process.env.LAUNCHDOCK_STACK_ID
      }
    }, (err) => {
      if (err) {
        Logger.error(err);
      } else {
        Logger.info("Updated default admin with Launchdock account info.");
      }
    });
  }
  return user;
});
