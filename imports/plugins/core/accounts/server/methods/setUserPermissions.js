import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import Reaction from "/server/api/core";

/**
 * @name accounts/setUserPermissions
 * @memberof Accounts/Methods
 * @method
 * @param {String} userId - userId
 * @param {String|Array} permissions - string/array of permissions
 * @param {String} group - group
 * @returns {Boolean} returns Roles.setUserRoles result
 */
export default function setUserPermissions(userId, permissions, group) {
  if (!Reaction.hasPermission("reaction-accounts", Meteor.userId(), group)) {
    throw new Meteor.Error("access-denied", "Access denied");
  }
  check(userId, String);
  check(permissions, Match.OneOf(String, Array));
  check(group, Match.Optional(String));
  this.unblock();
  try {
    return Roles.setUserRoles(userId, permissions, group);
  } catch (error) {
    Logger.error(error);
    return error;
  }
}
