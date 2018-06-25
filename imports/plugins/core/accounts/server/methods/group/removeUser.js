import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import Reaction from "/server/api/core";
import { Accounts, Groups } from "/lib/collections";
import setUserPermissions from "../../util/setUserPermissions";

/**
 * @name group/removeUser
 * @method
 * @memberof Group/Methods
 * @summary Removes a user from a group for a shop, and adds them to the default customer group.
 * Updates the user's permission list to reflect.
 * (NB: At this time, a user only belongs to only one group per shop)
 * @param {String} userId - The account ID to remove from the group
 * @param {String} groupId - ID of the group
 * @return {Object} - The modified group object
 */
export default function removeUser(userId, groupId) {
  check(userId, String);
  check(groupId, String);

  const user = Accounts.findOne({ _id: userId });
  const { shopId } = Groups.findOne({ _id: groupId }) || {};
  const defaultCustomerGroupForShop = Groups.findOne({ slug: "customer", shopId }) || {};

  // we are limiting group method actions to only users with admin roles
  // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
  if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  if (!user) {
    throw new Meteor.Error("invalid-parameter", "Could not find user");
  }

  try {
    setUserPermissions(user, defaultCustomerGroupForShop.permissions, shopId);
    Accounts.update({ _id: userId, groups: groupId }, { $set: { "groups.$": defaultCustomerGroupForShop._id } }); // replace the old id with new id
    Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
      accountId: userId,
      updatedFields: ["groups"]
    });
    return defaultCustomerGroupForShop;
  } catch (error) {
    Logger.error(error);
    throw new Meteor.Error("server-error", "Could not add user");
  }
}
