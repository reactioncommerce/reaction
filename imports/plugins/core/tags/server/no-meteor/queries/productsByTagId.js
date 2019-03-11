import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name queries.productsByTagId
 * @method
 * @memberof Tags/GraphQL
 * @summary get a list of products by tag id
 * @param {Object} context - an object containing the per-request state
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.shopId] - Shop ID
 * @param {String} [params.tagId] - Tag ID
 * @return {Promise<Array<Object>>} array of TagProducts
 */
export default async function productsByTagId(context, params) {
  const { shopId, tagId } = params;
  const { collections, userHasPermission } = context;
  const { Products, Tags } = collections;

  // Check for owner or admin permissions from the user before allowing the query
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const tag = await Tags.findOne({
    _id: tagId
  });

  if (!tag) {
    throw new ReactionError("not-found", "Tag not found");
  }

  // Match all products that belong to a single tag
  const match = {
    $match: {
      "product.tagIds": {
        $in: [tagId]
      }
    }
  };

  // Products from catalog sample data
  const positions = tag.featuredProductIds || [];

  if (positions.length) {
    // Add a new field "positions" to each product with the order they are in the array
    const addFields = {
      $addFields: {
        position: {
          $indexOfArray: [positions, "$_id"]
        }
      }
    };

    // Projection: Add a featuredPosition by order
    const projection = {
      $project: {
        _id: 1,
        position: 1,
        title: 1,
        sortPosition: {
          $cond: {
            if: { $lt: ["$position", 0] },
            then: { $add: [{ $abs: "$position" }, positions.length] },
            else: "$position"
          }
        }
      }
    };

    // Sort the results by "sortPosition"
    const sort = {
      $sort: {
        sortPosition: 1
      }
    };

    // Profit
    return {
      collection: Products,
      pipeline: [match, addFields, projection, sort]
    };
  }

  const sort = {
    $sort: {
      createdAt: 1
    }
  };

  // Profit
  return {
    collection: Products,
    pipeline: [match, sort]
  };
}
