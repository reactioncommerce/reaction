import Logger from "@reactioncommerce/logger";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name accounts/removeUserPermissions
 * @memberof Accounts/Methods
 * @method
 * @param {String} userId - userId
 * @param {Array|String} permissions - Name of role/permission.
 * If array, users returned will have at least one of the roles specified but need not have _all_ roles.
 * @param {String} [group] Optional name of group to restrict roles to.
 * @returns {Boolean} success/failure
 */
export default function removeUserPermissions(userId, permissions, group) {
  if (!Reaction.hasPermission("reaction-accounts", Reaction.getUserId(), group)) {
    throw new ReactionError("access-denied", "Access denied");
  }
  check(userId, String);
  check(permissions, Match.OneOf(String, Array));
  check(group, Match.Optional(String, null));
  this.unblock();
  try {
    return Roles.removeUsersFromRoles(userId, permissions, group);
  } catch (error) {
    Logger.error(error);
    throw new ReactionError("access-denied", "Access Denied");
  }
}
