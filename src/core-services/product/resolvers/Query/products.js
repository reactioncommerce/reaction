import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeProductOpaqueId, decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/products
 * @method
 * @memberof Products/Query
 * @summary query the Products collection
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Products
 */
export default async function products(_, args, context, info) {
  const {
    productIds: opaqueProductIds,
    shopIds: opaqueShopIds,
    tagIds: opaqueTagIds,
    query: queryString,
    visibility,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
    weightMin,
    weightMax,
    ...connectionArgs
  } = args;

  const shopIds = opaqueShopIds.map(decodeShopOpaqueId);
  const productIds = opaqueProductIds && opaqueProductIds.map(decodeProductOpaqueId);
  const tagIds = opaqueProductIds && opaqueTagIds.map(decodeTagOpaqueId);

  const query = await context.queries.products(context, {
    productIds,
    shopIds,
    tagIds,
    query: queryString,
    visibility,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
    weightMin,
    weightMax
  });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
