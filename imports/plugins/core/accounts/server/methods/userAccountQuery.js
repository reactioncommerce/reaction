import { Meteor } from "meteor/meteor";

/**
 * @name userAccountQuery
 * @method
 * @summary query the Accounts collection and return user account data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of user to query
 * @return {Object} user account object
 */
export async function userAccountQuery(context, id) {
  const { collections, hasPermission, userId } = context;
  const { Accounts } = collections;

  // Check to make sure current user has permissions to view queried user
  if (userId !== id) {
    const allowed = await hasPermission("reaction-accounts", userId);
    if (!allowed) throw new Meteor.Error("access-denied", "User does not have permission");
  }

  // Query the accounts collection to find user by `id`
  const userAccount = await Accounts.findOne({
    _id: id
  });

  // If user is not found, throw an error
  if (!userAccount) throw new Meteor.Error("not-found", "No account found");

  // If account is found, return userAccount
  return userAccount;
}
