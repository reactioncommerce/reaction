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

  // Products from catalog sample data
  const positions = tag.featuredProductIds;

  // Aggregation Pipeline
  // Find the products in the "order" array
  const match = {
    $match: {
      shopId,
      hashtags: { $in: [tagId] }
    }
  };

  // Add a new field "__order" to each product with the order they are in the array
  const addFields = {
    $addFields: {
      position: {
        $indexOfArray: [positions, "$_id"]
      }
    }
  };

  // Sort the results by "__order"
  const sort = {
    $sort: {
      position: 1
    }
  };

  // Profit
  return {
    collection: Products,
    pipeline: [match, addFields, sort]
  };
}
