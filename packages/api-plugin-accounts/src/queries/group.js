import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name group
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Groups collection and return group data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of group to query
 * @returns {Object} group object
 */
export default async function groupQuery(context, id) {
  const { account: authContextAccount, collections } = context;
  const { Groups } = collections;

  const group = await Groups.findOne({ _id: id });
  if (!group) throw new ReactionError("not-found", "There is no group with this ID");

  // If the user has sufficient permissions, then allow them to find any group by ID
  // TODO: Break this query up into one for all groups (for admins only) and one for user's groups
  const allowed = await context.userHasPermission("reaction:legacy:groups", "read", { shopId: group.shopId });
  if (allowed) return group;

  // Otherwise, only let users see groups that they are members of
  if (!authContextAccount || !authContextAccount.groups.includes(id)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  return group;
}
