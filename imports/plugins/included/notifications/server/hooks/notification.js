import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import MethodHooks from "/imports/plugins/core/core/server/method-hooks";
import Reaction from "/imports/plugins/core/core/server/Reaction";

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

const sendNotificationToAdmin = (adminUserId) => {
  const type = "forAdmin";
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/dashboard/orders`;
  const sms = true;

  const account = Accounts.findOne({ userId: adminUserId }, { fields: { _id: 1 } });
  if (!account) {
    throw new Error(`No account found for admin user ID ${adminUserId}`);
  }

  // Sending notification to admin
  Logger.debug("sending notification to admin");
  return Meteor.call("notification/send", account._id, type, url, sms);
};

MethodHooks.after("cart/copyCartToOrder", (options) => {
  const userId = Meteor.userId();
  const type = "newOrder";
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  const sms = true;

  const account = Accounts.findOne({ userId }, { fields: { _id: 1 } });
  if (!account) {
    throw new Error(`No account found for user ID ${userId}`);
  }
  const accountId = account._id;

  // Send notification to user who made the order
  Logger.debug(`sending notification to account: ${accountId}`);
  Meteor.call("notification/send", accountId, type, url, sms);

  // Sending notification to admin
  const adminId = getAdminUserId();
  if (adminId) {
    sendNotificationToAdmin(adminId);
  }

  return options.result;
});
