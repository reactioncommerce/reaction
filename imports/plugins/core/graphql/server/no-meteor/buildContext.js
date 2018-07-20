import { getHasPermissionFunctionForUser } from "/imports/plugins/core/accounts/server/no-meteor/hasPermission";
import getShopIdForContext from "/imports/plugins/core/accounts/server/no-meteor/getShopIdForContext";
import mutations from "./mutations";
import queries from "./queries";

/**
 * @name buildContext
 * @method
 * @memberof GraphQL
 * @summary Mutates the provided context object, adding `user`, `userId`, `shopId`, and
 *   `userHasPermission` properties.
 * @param {Object} context - A context object on which to set additional context properties
 * @param {Object} [user] - The user who authenticated this request, if applicable
 * @returns {undefined} No return
 */
export default async function buildContext(context, user) {
  context.mutations = mutations;
  context.queries = queries;

  context.user = user || null;
  const userId = (user && user._id) || null;
  context.userId = userId;

  if (userId) {
    const account = await context.collections.Accounts.findOne({ userId });
    context.account = account;
    context.accountId = (account && account._id) || null;
  }

  // Add the shopId for this request, either from the authenticated user's preferences or based on the ROOT_URL domain name
  context.shopId = await getShopIdForContext(context);

  // Add a curried hasPermission tied to the current user (or to no user)
  context.userHasPermission = getHasPermissionFunctionForUser(context.user);
}
