import { Meteor } from "meteor/meteor";

/**
 * @name catalogItems
 * @method
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.shopIds] - Shop IDs to include (OR)
 * @param {String[]} [params.tags] - Tag IDs to include (OR)
 * @param {Boolean} [params.shouldIncludeDeleted] - Whether or not to include `isDeleted=true` tags. Default is `false`
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItems(context, { shopIds, tagIds, shouldIncludeDeleted } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  if ((!shopIds || shopIds.length === 0) && (!tagIds || tagIds.length === 0)) {
    throw new Meteor.Error("invalid-param", "You must provide tagIds or shopIds or both");
  }

  const query = {};

  if (shopIds) query.shopId = { $in: shopIds };
  if (tagIds) query.hashtags = { $in: tagIds };
  if (shouldIncludeDeleted !== true) query.isDeleted = { $ne: true };

  return Catalog.find(query);
}
