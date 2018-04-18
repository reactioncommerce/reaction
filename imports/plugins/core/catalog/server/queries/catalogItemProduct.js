import { Meteor } from "meteor/meteor";

/**
 * @name catalogItemProduct
 * @method
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.shopIds] - Shop IDs to include (OR)
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItemProduct(context, { slugOrId } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  if (!slugOrId) {
    throw new Meteor.Error("invalid-param", "You must provide a slug or product id");
  }

  const query = {
    $or: [{ handle: slugOrId }, { _id: slugOrId }]
  };

  return Catalog.findOne(query);
}
