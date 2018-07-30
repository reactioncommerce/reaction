import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";

/**
 * @name catalogItems
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.shopIds] - Shop IDs to include (OR)
 * @param {String[]} [params.tags] - Tag IDs to include (OR)
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItems(context, { shopIds, tagIds } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  if ((!shopIds || shopIds.length === 0) && (!tagIds || tagIds.length === 0)) {
    throw new ReactionError("invalid-param", "You must provide tagIds or shopIds or both");
  }

  const query = {
    "product.isDeleted": { $ne: true },
    "product.isVisible": true
  };

  if (shopIds) query.shopId = { $in: shopIds };
  if (tagIds) query["product.tagIds"] = { $in: tagIds };

  return Catalog.find(query);
}
