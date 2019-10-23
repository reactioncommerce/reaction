import ReactionError from "@reactioncommerce/reaction-error";

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
  const { collections, userHasPermission, userId } = context;
  const { Accounts, Groups } = collections;

  if (userHasPermission(["owner", "admin", "reaction-accounts"], shopId)) {
    // find groups by shop ID
    return Groups.find({ shopId });
  }

  const userAccount = await Accounts.findOne({
    userId
  }, {
    projection: {
      groups: 1
    }
  });

  // If user is not found, throw an error
  if (!userAccount) throw new ReactionError("access-denied", "User does not have permissions to view groups");

  // find groups by shop ID limited to those the current user is in
  return Groups.find({
    _id: {
      $in: userAccount.groups || []
    },
    shopId
  });
}
