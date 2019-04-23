import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import ReactionError from "@reactioncommerce/reaction-error";
import xformCatalogBooleanFilters from "../../utils/catalogBooleanFilters";

/**
 * @name Query/catalogItems
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of catalogItems
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String[]} [args.shopIds] - limit to catalog items for these shops
 * @param {String[]} [args.tagIds] - limit to catalog items with this array of tags
 * @param {Object[]} [args.booleanFilters] - Array of boolean filter objects with `name` and `value`
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function catalogItems(_, args, context) {
  const { shopIds: opaqueShopIds, tagIds: opaqueTagIds, booleanFilters, ...connectionArgs } = args;

  const shopIds = opaqueShopIds && opaqueShopIds.map(decodeShopOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  let catalogBooleanFilters = {};
  if (Array.isArray(booleanFilters) && booleanFilters.length) {
    catalogBooleanFilters = await xformCatalogBooleanFilters(context, booleanFilters);
  }

  if (connectionArgs.sortBy === "featured") {
    if (!tagIds || tagIds.length === 0) {
      throw new ReactionError("not-found", "A tag ID is required for featured sort");
    }
    if (tagIds.length > 1) {
      throw new ReactionError("invalid-parameter", "Multiple tags cannot be sorted by featured. Only the first tag will be returned.");
    }
    const tagId = tagIds[0];
    return context.queries.catalogItemsAggregate(context, {
      catalogBooleanFilters,
      connectionArgs,
      shopIds,
      tagId
    });
  }

  // minPrice is a sorting term that does not necessarily match the field path by which we truly want to sort.
  // We allow plugins to return the true field name, or fallback to the default pricing field.
  if (connectionArgs.sortBy === "minPrice") {
    let realSortByField;

    // Allow external pricing plugins to handle this if registered. We'll use the
    // first value returned that is a string.
    for (const func of context.getFunctionsOfType("getMinPriceSortByFieldPath")) {
      realSortByField = await func(context, { connectionArgs }); // eslint-disable-line no-await-in-loop
      if (typeof realSortByField === "string") break;
    }

    if (!realSortByField) {
      if (typeof connectionArgs.sortByPriceCurrencyCode !== "string") {
        throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
      }
      realSortByField = `product.pricing.${connectionArgs.sortByPriceCurrencyCode}.minPrice`;
    }

    connectionArgs.sortBy = realSortByField;
  }

  const query = await context.queries.catalogItems(context, {
    catalogBooleanFilters,
    shopIds,
    tagIds
  });

  return getPaginatedResponse(query, connectionArgs);
}
