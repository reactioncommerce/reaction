import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name roles
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Shops collection, filter over packages, and return available roles data
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query
 * @returns {Object} roles object Promise
 */
export default async function rolesQuery(context, shopId) {
  const { collections, userHasPermission } = context;
  const { roles } = collections;

  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permissions to view roles");
  }

  return roles.find({});
}
