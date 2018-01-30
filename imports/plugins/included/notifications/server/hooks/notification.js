import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks, Reaction } from "/server/api";

const getAdminUserId = () => {
  // TODO validate with multiple show owners
  // switch to using getShopId for role lookup
  const admin = Meteor.users.findOne({
    "roles.__global_roles__": "owner"
  });
  if (admin && typeof admin === "object") {
    return admin._id;
  }
  return false;
};

const sendNotificationToAdmin = (adminId) => {
  const type = "forAdmin";
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/dashboard/orders`;
  const sms = true;
  // Sending notification to admin
  Logger.debug("sending notification to admin");
  return Meteor.call("notification/send", adminId, type, url, sms);
};

MethodHooks.after("cart/copyCartToOrder", (options) => {
  const userId = Meteor.userId();
  const type = "newOrder";
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  const sms = true;

  // Send notification to user who made the order
  Logger.debug(`sending notification to user: ${userId}`);
  Meteor.call("notification/send", userId, type, url, sms);

  // Sending notification to admin
  const adminId = getAdminUserId();
  if (adminId) {
    return sendNotificationToAdmin(adminId);
  }
  return options.result;
});
