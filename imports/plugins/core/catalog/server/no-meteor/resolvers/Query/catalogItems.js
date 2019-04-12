import ReactionError from "@reactioncommerce/reaction-error";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import {
  getOffsetBasedPaginatedResponse,
  getPaginatedResponse,
  getOffsetBasedPaginatedResponseFromAggregation
} from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name "Query.catalogItems"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of catalogItems
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.shopIds - limit to catalog items for these shops
 * @param {Array} args.tagIds - limit to catalog items with this array of tags
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function catalogItems(_, args, context) {
  const { shopIds: opaqueShopIds, tagIds: opaqueTagIds, isSoldOut, ...connectionArgs } = args;
  const { first, last, before, after, limit, page } = connectionArgs;
  const shopIds = opaqueShopIds && opaqueShopIds.map(decodeShopOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);
  const isPaginationCursorBased = first || last || before || after;
  const isPaginationOffsetBased = limit || page;

  if (isPaginationCursorBased && isPaginationOffsetBased) {
    throw new ReactionError(
      "invalid-parameter",
      "Parameters `first`, `last`, `before` and `after` are not supported along side `limit` and `page`."
    );
  }

  if (connectionArgs.sortBy === "featured") {
    if (!tagIds || tagIds.length === 0) {
      throw new ReactionError("not-found", "A tag ID is required.");
    }

    if (tagIds.length > 1) {
      throw new ReactionError("invalid-parameter", "Multiple tags cannot be sorted by featured. Only the first tag will be returned.");
    }

    if (isPaginationCursorBased) {
      throw new ReactionError(
        "invalid-parameter",
        "Parameters `first`, `last`, `before` and `after` are not supported for `sortBy:featured`. Use `page` and `limit` instead."
      );
    }

    const tagId = tagIds[0];
    const aggregationOptions = await context.queries.catalogItemsAggregate(context, {
      isSoldOut,
      shopIds,
      tagId
    });

    return getOffsetBasedPaginatedResponseFromAggregation(aggregationOptions, connectionArgs);
  }

  const cursor = await context.queries.catalogItems(context, {
    isSoldOut,
    shopIds,
    tagIds
  });

  // Maintain backwards compatibility with cursor based pagination
  if (isPaginationCursorBased) {
    if (connectionArgs.sortBy === "minPrice") {
      if (typeof connectionArgs.sortByPriceCurrencyCode !== "string") {
        throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
      }
      connectionArgs.sortBy = `product.pricing.${connectionArgs.sortByPriceCurrencyCode}.minPrice`;
    }
    return getPaginatedResponse(cursor, connectionArgs);
  }

  return getOffsetBasedPaginatedResponse(cursor, connectionArgs);
}
