import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name queries.productsByTagId
 * @method
 * @memberof Tags/GraphQL
 * @summary get list of product by tag id
 * @param {Object} context - an object containing the per-request state
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.shopId] - Shop ID
 * @param {String} [params.tagId] - Tag ID
 * @return {Promise<Array<Object>>} array of TagProducts
 */
export default async function productsByTagId(context, params) {
  const { shopId, tagId } = params;
  const { collections, userHasPermission } = context;
  const { Products } = collections;

  // Check for owner or admin permissions from the user before allowing the query
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  return Products.find({
    shopId,
    hashtags: { $in: tagId }
  });
}
