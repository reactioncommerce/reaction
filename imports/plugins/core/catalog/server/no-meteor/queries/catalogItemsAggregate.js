import ReactionError from "@reactioncommerce/reaction-error";
import arrayJoinPlusRemainingQuery from "/imports/utils/arrayJoinPlusRemainingQuery";

/**
 * @name catalogItemsAggregate
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary Query the Catalog by shop IDs and/or a tag ID in featured product order
 * @param {Object} context - An object containing the per-request state
 * @param {Object} params - Request parameters
 * @param {Boolean} [params.isSoldOut] - Pass a boolean to filter by this value for isSoldOut
 * @param {String[]} [params.shopIds] - Shop IDs to include
 * @param {String} params.tagId - Tag ID
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItemsAggregate(context, {
  connectionArgs,
  isSoldOut,
  shopIds,
  tagId
} = {}) {
  const { collections } = context;
  const { Catalog, Tags } = collections;

  if (!tagId) throw new ReactionError("invalid-param", "You must provide a tagId");

  const selector = {
    "product.tagIds": tagId,
    "product.isDeleted": { $ne: true },
    "product.isVisible": true
  };

  if (shopIds && shopIds.length > 0) {
    selector.shopId = { $in: shopIds };
  }

  // If isSoldOut filter is provided, add it to the query
  if (typeof isSoldOut === "boolean") {
    selector["product.isSoldOut"] = isSoldOut;
  }

  return arrayJoinPlusRemainingQuery({
    arrayFieldPath: "featuredProductIds",
    collection: Tags,
    connectionArgs,
    joinCollection: Catalog,
    joinCollectionName: "Catalog",
    joinFieldPath: "product._id",
    joinSelector: selector,
    joinSortOrder: "asc",
    positionFieldName: "position",
    selector: { _id: tagId },
    sortByForRemainingDocs: "createdAt",
    sortOrderForRemainingDocs: "asc"
  });
}
