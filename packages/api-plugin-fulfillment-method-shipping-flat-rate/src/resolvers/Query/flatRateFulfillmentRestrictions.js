import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

/**
 * @name Query/flatRateFulfillmentRestrictions
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the flatRateFulfillmentRestrictions GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns these restriction
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>|undefined} A Restriction object
 */
export default async function flatRateFulfillmentRestrictions(parentResult, args, context, info) {
  const { shopId, ...connectionArgs } = args;

  const cursor = await context.queries.flatRateFulfillmentRestrictions(context, { shopId });

  return getPaginatedResponse(cursor, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
