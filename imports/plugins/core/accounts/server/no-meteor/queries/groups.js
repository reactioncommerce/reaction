import { Meteor } from "meteor/meteor";

/**
 * @name groups
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Groups collection and return a MongoDB cursor
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID to get groups for
 * @return {Object} Groups collection cursor
 */
export async function groups(context, shopId) {
  const { collections, userHasPermission, userId } = context;
  const { Accounts, Groups } = collections;

  if (userHasPermission(["owner", "admin", "reaction-accounts"], shopId)) {
    // find groups by shop ID
    return Groups.find({ shopId });
  }

  const userAccount = Accounts.findOne({
    _id: userId
  }, {
    projection: {
      groups: 1
    }
  });

  // If user is not found, throw an error
  if (!userAccount) throw new Meteor.Error("access-denied", "User does not have permissions to view groups");

  // find groups by shop ID limited to those the current user is in
  return Groups.find({
    _id: {
      $in: userAccount.groups || []
    },
    shopId
  });
}
