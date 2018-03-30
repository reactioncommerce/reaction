import { Meteor } from "meteor/meteor";

/**
 * @name groupQuery
 * @method
 * @summary query the Groups collection and return group data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of group to query
 * @return {Object} group object
 */
export async function groupQuery(context, id) {
  const { collections, userId } = context;
  const { Accounts, Groups } = collections;

  // If the user is an has sufficient permissions, then allow them to find any group by id
  if (await context.hasPermission(["owner", "admin", "reaction-accounts"], userId)) {
    // find groups by shop ID
    return Groups.findOne({ _id: id });
  }

  // Otherwise, only let users see groups that they are members of
  const userAccount = await Accounts.findOne({
    _id: userId,
    groups: id
  }, {
    projection: {
      _id: 1
    }
  });

  if (userAccount) {
    // Query the groups collection to find a group by `id`
    return Groups.findOne({ _id: id });
  }

  // If user is not found, throw an error
  throw new Meteor.Error("access-denied", "User does not have permissions to view group");
}

export async function groupsQuery(context, shopId) {
  const { collections, userId } = context;
  const { Accounts, Groups } = collections;

  if (await context.hasPermission(["owner", "admin", "reaction-accounts"], userId)) {
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

  if (userAccount && Array.isArray(userAccount.groups) && userAccount.groups.length) {
    // Query the groups collection to find a group by `id`
    return Groups.find({
      _id: {
        $in: userAccount.groups
      },
      shopId
    });
  }

  // If user is not found, throw an error
  throw new Meteor.Error("access-denied", "User does not have permissions to view group");
}
