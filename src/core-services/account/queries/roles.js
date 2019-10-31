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
  const { checkPermissionsLegacy, collections } = context;
  const { roles } = collections;

  // TODO: pod-auth - not sure what do here with permissions
  await checkPermissionsLegacy(["owner", "admin"], shopId);

  return roles.find({});
}
