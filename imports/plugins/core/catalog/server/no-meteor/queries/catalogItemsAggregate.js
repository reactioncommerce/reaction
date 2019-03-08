import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItemsAggregate
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary Query the Catalog by shop IDs and/or a tag ID in featured product order
 * @param {Object} context - An object containing the per-request state
 * @param {Object} params - Request parameters
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
  
  // Match all products that belong to a single tag
  const match = {
    $match: {
      "product.tagIds": {
        $in: [tagId]
      }
    }
  };
  
  const tag = await Tags.findOne({
    _id: tagId
  });

  if (!tag) {
    throw new ReactionError("not-found", "Tag not found");
  }

  // If there are no featuredProductIds, return match
  if (!tag.featuredProductIds) {
    return {
      collection: Catalog,
      pipeline: [match]
    };
  }

  // Array of tag's featured product Ids in order
  const order = tag.featuredProductIds;

  // Add a new field "order" to each product with their order in the array
  const addFields = {
    $addFields: {
      __order: {
        $indexOfArray: [order, "$product._id"]
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
          if: { $lt: ["$__order", 0] },
          then: { $add: [{ $abs: "$__order" }, order.length] },
          else: "$__order"
        }
      }
    }
  };

  // Facet: Sort by featuredPosition
  // Add pageInfo and count
  const facet = {
    $facet: {
      nodes: [
        {
          $sort: {
            featuredPosition: 1
          }
        }
      ],
      pageInfo: [
        { $count: "totalCount" }
      ]
    }
  };

  return {
    collection: Catalog,
    pipeline: [match, addFields, projection, facet]
  };
}
