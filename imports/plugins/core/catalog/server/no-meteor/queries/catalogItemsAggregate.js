import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItemsAggregate
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog by shop ID and/or tag ID in featured product order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.shopIds] - Shop IDs to include
 * @param {String} tagId - Tag ID
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItemsAggregate(context, { shopIds, tagId } = {}) {
  const { collections } = context;
  const { Catalog, Tags } = collections;

  if ((!shopIds || shopIds.length === 0) && (!tagId)) {
    throw new ReactionError("invalid-param", "You must provide a tagId or shopIds or both");
  }

  const tag = await Tags.findOne({
    _id: tagId
  });

  if (!tag) {
    throw new ReactionError("not-found", "Tag not found");
  }

  // Get array of featured products ids, in order
  const order = tag.featuredProductIds;

  // Add a new field "order" to each product with their order in the array
  const addFields = {
    $addFields: {
      "__order": {
        "$indexOfArray": [order, "$product._id"]
      }
    }
  };

  // Projection: Add a featuredPosition by order
  const projection = {
    $project: {
      _id: 1,
      __order: 1,
      product: 1,
      featuredPosition: {
        $cond: {
          if: { $lt: [ "$__order", 0] },
          then: { $add: [ { $abs: "$__order" }, order.length ]},
          else: "$__order"
        }
      }
    }
  };
  
  // Sort by featuredPosition
  const sort = {
    $sort: {
      "featuredPosition": 1
    }
  };

  return {
    collection: Catalog,
    pipeline: [addFields, projection, sort]
  }
}
