import { getHasPermissionFunctionForUser } from "/imports/plugins/core/accounts/server/no-meteor/hasPermission";
import getShopIdForContext from "/imports/plugins/core/accounts/server/no-meteor/getShopIdForContext";
import getRootUrl from "/imports/plugins/core/core/server/util/getRootUrl";
import getAbsoluteUrl from "/imports/plugins/core/core/server/util/getAbsoluteUrl";
import mutations from "/imports/plugins/core/graphql/server/no-meteor/mutations";
import queries from "/imports/plugins/core/graphql/server/no-meteor/queries";

/**
 * @name buildContext
 * @method
 * @memberof GraphQL
 * @summary Mutates the provided context object, adding `user`, `userId`, `shopId`, and
 *   `userHasPermission` properties.
 * @param {Object} context - A context object on which to set additional context properties
 * @param {Object} request - Request object
 * @param {String} request.hostname - Hostname derived from Host or X-Forwarded-Host heaer
 * @param {Object} request.protocol - Either http or https
 * @param {Object} [request.user] - The user who authenticated this request, if applicable
 * @returns {undefined} No return
 */
export default async function buildContext(context, request) {
  const { user } = request;

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

  context.rootUrl = getRootUrl(request);
  context.getAbsoluteUrl = (path) => getAbsoluteUrl(context.rootUrl, path);
}
