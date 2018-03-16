import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import { Reaction } from "/lib/api";

/**
 * @name userAccountQuery
 * @method
 * @summary query the Accounts collection and return user account data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of user to query
 * @return {Object} user account object
 */
export function userAccountQuery(context, id) {
  const { _id: userId } = context.user || {};

  // Check to make sure current user has permissions to view queried user
  if (!Reaction.hasPermission("reaction-accounts", userId) && userId !== id) throw new Meteor.Error("access-denied", "User does not have permission");

  // Query the accounts collection to find user by `id`
  const userAccount = Accounts.findOne({
    _id: id
  });

  // If user is not found, throw an error
  if (!userAccount) throw new Meteor.Error("not-found", "No account found");

  // If account is found, return userAccount
  return userAccount;
}
