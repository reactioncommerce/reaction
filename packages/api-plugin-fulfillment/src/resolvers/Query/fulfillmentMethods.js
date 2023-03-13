import getPaginatedResponseFromAggregate from "@reactioncommerce/api-utils/graphql/getPaginatedResponseFromAggregate.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

/**
 * @name Query/fulfillmentMethods
 * @method
 * @memberof Fulfillment/Query
 * @summary Query for a list of fulfillment methods
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - Shop ID to get records for
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Fulfillment methods
 */
export default async function fulfillmentMethods(_, args, context, info) {
  const { shopId, fulfillmentTypeId, ...connectionArgs } = args;

  const { collection, pipeline } = await context.queries.fulfillmentMethods(context, {
    shopId, fulfillmentTypeId
  });

  return getPaginatedResponseFromAggregate(collection, pipeline, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
