import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name "Query.getFlatRateFulfillmentRestrictions"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the getFlatRateFulfillmentRestrictions GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns these restriction
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Restriction object
 */
export default async function getFlatRateFulfillmentRestrictions(parentResult, args, context) {
  const { shopId, ...connectionArgs } = args;

  const cursor = await context.queries.getFlatRateFulfillmentRestrictions(context, {
    shopId: decodeShopOpaqueId(shopId)
  });

  return getPaginatedResponse(cursor, connectionArgs);
}
