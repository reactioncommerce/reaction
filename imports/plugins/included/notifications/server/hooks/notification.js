import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks, Reaction } from "/server/api";
import { Accounts } from "/lib/collections";

const prefix = Reaction.getSlug(Reaction.getShopName().toLowerCase());

const getAdminUserId = () => {
  const admin = Accounts.find().fetch();
  return admin[0]._id;
};

const sendNotificationToAdmin = () => {
  const adminId = getAdminUserId();
  const type = "forAdmin";  
  const url = `/${prefix}/dashboard/orders`;
  const sms = true;
  // Sending notification to admin
  Logger.info("sending notification to admin");
  return Meteor.call("notification/send", adminId, type, url, sms);
};

MethodHooks.after("cart/copyCartToOrder", function () {
  const userId = Meteor.userId();
  const type = "newOrder";
  const url = `/${prefix}/notifications`;
  const sms = true;

  // Send notification to user who made the order
  Logger.info("Sending notification to user " + Meteor.userId());
  Meteor.call("notification/send", userId, type, url, sms);

  // Sending notification to admin
  sendNotificationToAdmin();
});
