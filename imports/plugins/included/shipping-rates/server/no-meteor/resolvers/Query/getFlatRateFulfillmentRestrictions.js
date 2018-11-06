import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name "Query.accountCartByAccountId"
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the accountCartByAccountId GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.accountId - The account for which to generate an account cart
 * @param {String} args.shopId - The shop that will own this cart
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Cart object
 */
export default async function getFlatRateFulfillmentRestrictions(parentResult, args, context) {
  const { shopId, ...connectionArgs } = args;

  const cursor = await context.queries.getFlatRateFulfillmentRestrictions(context, {
    shopId: decodeShopOpaqueId(shopId)
  });

  return getPaginatedResponse(cursor, connectionArgs);
}
