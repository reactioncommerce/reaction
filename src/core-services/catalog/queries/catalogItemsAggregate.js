import ReactionError from "@reactioncommerce/reaction-error";
import arrayJoinPlusRemainingQuery from "@reactioncommerce/api-utils/arrayJoinPlusRemainingQuery.js";

/**
 * @name catalogItemsAggregate
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary Query the Catalog by shop IDs and/or a tag ID in featured product order
 * @param {Object} context - An object containing the per-request state
 * @param {Object} params - Request parameters
 * @param {Object} [params.catalogBooleanFilters] - Additional filters object to add to the selector
 * @param {String[]} [params.shopIds] - Shop IDs to include
 * @param {String} params.tagId - Tag ID
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItemsAggregate(context, {
  connectionArgs,
  catalogBooleanFilters,
  shopIds,
  tagId
} = {}) {
  const { collections } = context;
  const { Catalog, Tags } = collections;

  if (!tagId) throw new ReactionError("invalid-param", "You must provide a tagId");

  const selector = {
    "product.tagIds": tagId,
    "product.isDeleted": { $ne: true },
    "product.isVisible": true,
    ...catalogBooleanFilters
  };

  if (shopIds && shopIds.length > 0) {
    selector.shopId = { $in: shopIds };
  }

  return arrayJoinPlusRemainingQuery({
    arrayFieldPath: "featuredProductIds",
    collection: Tags,
    connectionArgs,
    joinCollection: Catalog,
    joinFieldPath: "product.productId",
    joinSelector: selector,
    joinSortOrder: "asc",
    positionFieldName: "position",
    selector: { _id: tagId },
    sortByForRemainingDocs: "createdAt",
    sortOrderForRemainingDocs: "asc"
  });
}
