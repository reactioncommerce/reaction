import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";

/**
 * @name rolesQuery
 * @method
 * @summary query the Shops collection, filter over packages, and return available roles data
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - id of Shop to query
 * @return {Object} roles object Promise
 */
export function rolesQuery(context) {
  const { userId } = context;

  if (Reaction.hasPermission(["owner", "admin"], userId)) {
    return Promise.resolve(Meteor.roles.rawCollection().find({}));
  }

  // If user doesn't have permission, throw an error
  throw new Meteor.Error("access-denied", "User does not have permissions to view roles");
}
