import { Meteor } from "meteor/meteor";

/**
 * @name groupQuery
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Groups collection and return group data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of group to query
 * @return {Object} group object
 */
export async function groupQuery(context, id) {
  const { collections, userHasPermission, userId } = context;
  const { Accounts, Groups } = collections;

  const group = await Groups.findOne({ _id: id });
  if (!group) throw new Meteor.Error("not-found", "There is no group with this ID");

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
  if (!userAccount) throw new Meteor.Error("access-denied", "User does not have permissions to view groups");

  return group;
}

/**
 * @name groupsQuery
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Groups collection and return a MongoDB cursor
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID to get groups for
 * @return {Object} Groups collection cursor
 */
export async function groupsQuery(context, shopId) {
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
