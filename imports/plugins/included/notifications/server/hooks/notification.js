import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks, Reaction } from "/server/api";
import { getSlug } from "/lib/api";

const getAdminUserId = () => {
  const admin = Meteor.users.findOne({
    "roles.__global_roles__": "owner"
  });
  if (admin) {
    return admin[0]._id;
  }
  return false;
};

const sendNotificationToAdmin = (adminId) => {
  const type = "forAdmin";
  const prefix = getSlug(Reaction.getShopName().toLowerCase());
  const url = `/${prefix}/dashboard/orders`;
  const sms = true;
  // Sending notification to admin
  Logger.info("sending notification to admin");
  return Meteor.call("notification/send", adminId, type, url, sms);
};

MethodHooks.after("cart/copyCartToOrder", function (options) {
  const userId = Meteor.userId();
  const type = "newOrder";
  const prefix = getSlug(Reaction.getShopName().toLowerCase());
  const url = `/${prefix}/notifications`;
  const sms = true;

  // Send notification to user who made the order
  Logger.info(`Sending notification to user: ${userId}`);
  Meteor.call("notification/send", userId, type, url, sms);

  // Sending notification to admin
  const adminId = getAdminUserId();
  if (adminId) {
    return sendNotificationToAdmin();
  }
  return options.result;
});
