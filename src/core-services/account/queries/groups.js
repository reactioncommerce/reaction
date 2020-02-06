/**
 * @name groups
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Groups collection and return a MongoDB cursor
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID to get groups for
 * @returns {Object} Groups collection cursor
 */
export default async function groups(context, shopId) {
  const { collections } = context;
  const { Groups } = collections;

  await context.validatePermissions("reaction:legacy:groups", "read", { shopId });

  // TODO: Break this query up into one for all groups (for admins only) and one for user's groups
  return Groups.find({ shopId });
}
