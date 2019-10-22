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
  const { collections, userHasPermission, userId } = context;
  const { Accounts, Groups } = collections;

  const group = await Groups.findOne({ _id: id });
  if (!group) throw new ReactionError("not-found", "There is no group with this ID");

  // If the user has sufficient permissions, then allow them to find any group by ID
  if (userHasPermission(["owner", "admin", "reaction-accounts"], group.shopId)) return group;

  // Otherwise, only let users see groups that they are members of
  const userAccount = await Accounts.findOne({
    _id: userId,
    groups: id
  }, {
    projection: {
      _id: 1
    }
  });

  // If user is not found, throw an error
  if (!userAccount) throw new ReactionError("access-denied", "User does not have permissions to view groups");

  return group;
}
