import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

/**
 * @name Query/accounts
 * @method
 * @memberof Accounts/Query
 * @summary Query for a list of accounts
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of shop to query
 * @param {Object} args.filter1level - filter conditions with 1 level
 * @param {Object} args.filter2level - filter conditions with 2 levels
 * @param {Object} args.filter3level - filter conditions with 3 levels
 * @param {String} args.level - filter level used
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Accounts
 */
export default async function filterSearchAccounts(_, args, context, info) {
  const {
    shopId,
    filter1level,
    filter2level,
    filter3level,
    level,
    ...connectionArgs
  } = args;

  const query = await context.queries.filterSearchAccounts(context, filter1level, filter2level, filter3level, level, shopId);

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
