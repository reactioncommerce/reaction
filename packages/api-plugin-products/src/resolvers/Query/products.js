import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeProductOpaqueId, decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/products
 * @method
 * @memberof Products/Query
 * @summary Query for a list of products
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Products
 */
export default async function products(_, args, context, info) {
  const {
    createdAt,
    updatedAt,
    productIds: opaqueProductIds,
    shopIds: opaqueShopIds,
    tagIds: opaqueTagIds,
    query: queryString,
    isArchived,
    isVisible,
    isExactMatch,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax,
    ...connectionArgs
  } = args;

  const shopIds = opaqueShopIds.map((opaqueShopId) => (isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId));
  const productIds = opaqueProductIds &&
    opaqueProductIds.map((opaqueProductId) => (isOpaqueId(opaqueProductId) ? decodeProductOpaqueId(opaqueProductId) : opaqueProductId));
  const tagIds = opaqueTagIds && opaqueTagIds.map((opaqueTagId) => (isOpaqueId(opaqueTagId) ? decodeTagOpaqueId(opaqueTagId) : opaqueTagId));

  const query = await context.queries.products(context, {
    createdAt,
    updatedAt,
    productIds,
    shopIds,
    tagIds,
    query: queryString,
    isArchived,
    isVisible,
    isExactMatch,
    metafieldKey,
    metafieldValue,
    priceMin,
    priceMax
  });

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
