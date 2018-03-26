import { Meteor } from "meteor/meteor";
import { Accounts, Groups } from "/lib/collections";
import { Reaction } from "/lib/api";

/**
 * @name groupQuery
 * @method
 * @summary query the Groups collection and return group data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of group to query
 * @return {Object} group object
 */
export function groupQuery(context, id) {
  const { userId } = context;

  // If the user is an has sufficient permissions, then allow them to find any group by id
  if (Reaction.hasPermission(["owner", "admin", "reaction-accounts"], userId)) {
    // find groups by shop ID
    return Groups.findOne({
      _id: id
    });
  }

  // Otherwise, only let users see groups that they are members of
  const userAccount = Accounts.findOne({
    _id: userId,
    groups: {
      $in: [id]
    }
  });

  if (userAccount) {
    // Query the groups collection to find a group by `id`
    return Groups.findOne({
      _id: id
    });
  }

  // If user is not found, throw an error
  throw new Meteor.Error("access-denied", "User does not have permissions to view group");
}

export function groupsQuery(context, shopId) {
  const { userId } = context;

  if (Reaction.hasPermission(["owner", "admin", "reaction-accounts"], userId)) {
    // find groups by shop ID
    return Promise.resolve(Groups.rawCollection().find({
      shopId
    }));
  }

  const userAccount = Accounts.findOne({
    _id: userId
  }, {
    fields: {
      groups: 1
    }
  });

  if (userAccount) {
    // Query the groups collection to find a group by `id`
    return Promise.resolve(Groups.rawCollection().find({
      _id: userAccount.groups,
      shopId
    }));
  }

  // If user is not found, throw an error
  throw new Meteor.Error("access-denied", "User does not have permissions to view group");
}
