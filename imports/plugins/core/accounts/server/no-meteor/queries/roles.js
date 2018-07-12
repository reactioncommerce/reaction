import { Meteor } from "meteor/meteor";

/**
 * @name roles
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Shops collection, filter over packages, and return available roles data
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query
 * @return {Object} roles object Promise
 */
export default async function rolesQuery(context) {
  const { collections, shopId: contextShopId, userHasPermission } = context;
  const { roles } = collections;

  if (!userHasPermission(["owner", "admin"], contextShopId)) {
    throw new Meteor.Error("access-denied", "User does not have permissions to view roles");
  }

  return roles.find({});
}
