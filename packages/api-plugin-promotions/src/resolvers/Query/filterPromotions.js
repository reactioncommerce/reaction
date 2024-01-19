import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

/**
 * @name Query/promotions
 * @method
 * @memberof Promotions/Query
 * @summary Query for a list of promotions
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of shop to query
 * @param {Object} args.conditions - object containing the filter conditions
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Promotions
 */
export default async function filterPromotions(_, args, context, info) {
  const {
    shopId,
    conditions,
    ...connectionArgs
  } = args;

  const query = await context.queries.filterPromotions(context, conditions, shopId);

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
