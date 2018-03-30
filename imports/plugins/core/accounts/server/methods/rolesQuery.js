import { Meteor } from "meteor/meteor";

/**
 * @name rolesQuery
 * @method
 * @summary query the Shops collection, filter over packages, and return available roles data
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query
 * @return {Object} roles object Promise
 */
export async function rolesQuery(context) {
  const { collections, hasPermission, userId } = context;
  const { roles } = collections;

  const allowed = await hasPermission(["owner", "admin"], userId);
  if (!allowed) throw new Meteor.Error("access-denied", "User does not have permissions to view roles");

  return roles.find({});
}
