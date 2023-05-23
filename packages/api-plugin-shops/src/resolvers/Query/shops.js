import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Shop/shops
 * @method
 * @memberof Shop/GraphQL
 * @summary find and return the shops for a shop
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopIds - Optional shopIds to filter by
 * @param {String} args.after - Connection argument
 * @param {String} args.before - Connection argument
 * @param {Number} args.first - Connection argument
 * @param {Number} args.last - Connection argument
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object[]>} Promise that resolves with array of shop objects
 */
export default async function shops(_, { shopIds, ...connectionArgs }, context, info) {
  let decodedShopIds;

  if (Array.isArray(shopIds) && shopIds.length > 0) {
    decodedShopIds = shopIds.map((shopId) => (isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId));
  }

  const query = await context.queries.shops(context, { shopIds: decodedShopIds });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
