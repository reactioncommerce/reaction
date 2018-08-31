import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * accounts
 */

Meteor.publish("Accounts", function () {
  const userId = Reaction.getUserId();

  if (!userId) {
    return this.ready();
  }

  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const nonAdminGroups = Collections.Groups.find({
    name: { $in: ["guest", "customer"] },
    shopId
  }, {
    fields: { _id: 1 }
  }).fetch().map((group) => group._id);

  // global admin can get all accounts
  if (Reaction.hasPermission(["owner"], userId, Roles.GLOBAL_GROUP)) {
    return Collections.Accounts.find({
      groups: { $nin: nonAdminGroups }
    });

  // shop admin gets accounts for just this shop
  } else if (Reaction.hasPermission(["admin", "owner", "reaction-accounts"], userId, shopId)) {
    return Collections.Accounts.find({
      groups: { $nin: nonAdminGroups },
      shopId
    });
  }

  // regular users should get just their account
  return Collections.Accounts.find({ userId });
});

/**
 * Single account
 * @params {String} userId -  id of user to find
 */
Meteor.publish("UserAccount", function (userId) {
  check(userId, Match.OneOf(String, null));

  const shopId = Reaction.getShopId();
  if (Reaction.hasPermission(["admin", "owner"], this.userId, shopId)) {
    return Collections.Accounts.find({
      userId
    });
  }
  return this.ready();
});
