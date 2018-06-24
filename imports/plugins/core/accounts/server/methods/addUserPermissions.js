import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/server/api/core";

/**
 * @name accounts/addUserPermissions
 * @memberof Accounts/Methods
 * @method
 * @param {String} userId - userId
 * @param {Array|String} permissions - Name of role/permission.
 * If array, users returned will have at least one of the roles specified but need not have _all_ roles.
 * @param {String} [group] Optional name of group to restrict roles to. User's Roles.GLOBAL_GROUP will also be checked.
 * @returns {Boolean} success/failure
 */
export default function addUserPermissions(userId, permissions, group) {
  if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
    throw new Meteor.Error("access-denied", "Access denied");
  }
  check(userId, Match.OneOf(String, Array));
  check(permissions, Match.OneOf(String, Array));
  check(group, Match.Optional(String));
  this.unblock();
  try {
    return Roles.addUsersToRoles(userId, permissions, group);
  } catch (error) {
    return Logger.error(error);
  }
}
