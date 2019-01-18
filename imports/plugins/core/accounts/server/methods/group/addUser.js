import Logger from "@reactioncommerce/logger";
import { Roles } from "meteor/alanning:roles";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { Accounts, Groups } from "/lib/collections";
import setUserPermissions from "../../util/setUserPermissions";

/**
 * changeMarketplaceOwner
 * @private
 * @summary Checks if the user making the request is allowed to make invitation to that group
 * @param {Object} options -
 * @param {String} options.userId - userID
 * @param {String} options.permissions - permissions
 * @return {null} -
 */
function changeMarketplaceOwner({ userId, permissions }) {
  // give global marketplace role to new owner
  Roles.setUserRoles(userId, permissions, Roles.GLOBAL_GROUP);
  // remove global from previous owner
  Meteor.users.update({ _id: Reaction.getUserId() }, { $unset: { [`roles.${Roles.GLOBAL_GROUP}`]: "" } });
}

/**
 * @name group/addUser
 * @method
 * @memberof Group/Methods
 * @summary Adds a user to a permission group
 * Updates the user's list of permissions/roles with the defined the list defined for the group
 * (NB: At this time, a user only belongs to only one group per shop)
 * @param {String} userId - The account ID to add to the group
 * @param {String} groupId - ID of the group
 * @return {Object} - The modified group object
 */
export default function addUser(userId, groupId) {
  check(userId, String);
  check(groupId, String);
  const group = Groups.findOne({ _id: groupId }) || {};
  const { permissions, shopId, slug } = group;
  const loggedInUserId = Reaction.getUserId();
  const canInvite = Reaction.canInviteToGroup({ group });

  // we are limiting group method actions to only users with admin roles
  // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
  if (!Reaction.hasPermission("admin", loggedInUserId, shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Users with `owner` and/or `admin` roles can invite to any group
  // Also a user with `admin` can invite to only groups they have permissions that are a superset of
  // See details of canInvite method in core (i.e Reaction.canInviteToGroup)
  if (!canInvite) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  if (slug === "owner") {
    // if adding a user to the owner group, check that the request is done by current owner
    if (!Reaction.hasPermission("owner", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }
  }

  // make sure user only belongs to one group per shop
  const allGroupsInShop = Groups.find({ shopId }).fetch().map((grp) => grp._id);
  const account = Accounts.findOne({ userId }) || {};
  const currentUserGroups = account.groups || [];
  let newGroups = [];
  let currentUserGrpInShop;
  currentUserGroups.forEach((grp) => {
    if (allGroupsInShop.indexOf(grp) < 0) {
      newGroups.push(grp);
    } else {
      currentUserGrpInShop = grp;
    }
  });
  newGroups = newGroups.concat(groupId);

  try {
    setUserPermissions({ _id: userId }, permissions, shopId);
    Accounts.update({ userId }, { $set: { groups: newGroups } });

    const updatedAccount = Accounts.findOne({ userId });
    Promise.await(appEvents.emit("afterAccountUpdate", {
      account: updatedAccount,
      updatedBy: loggedInUserId,
      updatedFields: ["groups"]
    }));

    if (slug === "owner") {
      if (shopId === Reaction.getPrimaryShopId()) {
        changeMarketplaceOwner({ userId, permissions });
      }
      // remove current shop owner after setting another admin as the new owner
      Meteor.call("group/addUser", Reaction.getUserId(), currentUserGrpInShop);
    }

    // Return the group the account as added to
    return Groups.findOne({ _id: groupId });
  } catch (error) {
    Logger.error(error);
    throw new ReactionError("server-error", "Could not add user");
  }
}
