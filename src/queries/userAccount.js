import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name userAccount
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Accounts collection and return user account data
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - id of user to query
 * @returns {Object} user account object
 */
export default async function userAccountQuery(context, id) {
  const { collections } = context;
  const { Accounts } = collections;

  const account = await Accounts.findOne({ _id: id });
  if (!account) throw new ReactionError("not-found", "No account found");

  // Check to make sure current user has permissions to view queried user
  await context.validatePermissions("reaction:legacy:accounts", "read", {
    owner: account.userId
  });

  return account;
}
