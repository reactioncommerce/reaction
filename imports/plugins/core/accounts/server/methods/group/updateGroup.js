import Logger from "@reactioncommerce/logger";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { Accounts, Groups } from "/lib/collections";
import setUserPermissions from "../../util/setUserPermissions";

/**
 * @name group/updateGroup
 * @method
 * @memberof Group/Methods
 * @summary Updates a permission group for a shop.
 * Change the details of a group (name, desc, permissions etc) to the values passed in.
 * It also goes into affected user data to modify both the groupName (using Accounts schema)
 * and group permissions (using "accounts/removeUserPermissions")
 * @param {Object} groupId - group to be updated
 * @param {Object} newGroupData - updated group info (similar to current group data)
 * slug remains untouched; used as key in querying
 * @param {String} shopId - id of the shop the group belongs to
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default function updateGroup(groupId, newGroupData, shopId) {
  check(groupId, String);
  check(newGroupData, Object);
  check(shopId, String);

  // we are limiting group method actions to only users with admin roles
  // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
  if (!Reaction.hasPermission("admin", Reaction.getUserId(), shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // 1. Update the group data
  const update = newGroupData;
  delete update.slug; // slug remains constant because it's used as key in querying. So we remove it if it was passed

  const group = Groups.findOne({ _id: groupId }) || {};

  // prevent edits on owner. Owner groups is the default containing all roles, and as such should be untouched
  if (group.slug === "owner") {
    throw new ReactionError("invalid-parameter", "Bad request");
  }

  Groups.update({ _id: groupId, shopId }, { $set: update });

  // 2. Check & Modify users in the group that changed
  const users = Accounts.find({ groups: { $in: [groupId] } }).fetch();
  let error;

  if (newGroupData.permissions && newGroupData.permissions.length) {
    error = setUserPermissions(users, newGroupData.permissions, shopId);
  }

  // 3. Return response
  if (!error) {
    return { status: 200, group: Groups.findOne({ _id: groupId }) };
  }
  Logger.error(error);
  throw new ReactionError("server-error", "Update not successful");
}
