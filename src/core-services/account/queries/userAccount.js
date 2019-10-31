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
  const { checkPermissionsLegacy, collections, userId } = context;
  const { Accounts } = collections;

  const account = await Accounts.findOne({ _id: id });
  if (!account) throw new ReactionError("not-found", "No account found");

  // Check to make sure current user has permissions to view queried user
  if (userId !== account.userId) {
    await checkPermissionsLegacy(["reaction-accounts"], account.shopId);
  }

  return account;
}
