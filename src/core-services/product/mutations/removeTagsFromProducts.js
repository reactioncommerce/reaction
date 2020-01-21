import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method removeTagsFromProducts
 * @summary Removes an array of tag ids to an array of products looked up by product id.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.productIds - an array of Product IDs
 * @param {String} input.shopId - the shop id
 * @param {String[]} input.tagIds - an array of Tag IDs
 * @return {Object} Object with information of results of bulk the operation
 */
export default async function removeTagsFromProducts(context, input) {
  const { productIds, shopId, tagIds } = input;
  const { collections: { Products } } = context;
  const totalProducts = productIds.length;

  for (const _id of productIds) {
    // TODO(pod-auth): figure out a better way to loop through this
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions(`reaction:legacy:products:${_id}`, "update", { shopId });
  }

  // Generate update statements
  const operations = productIds.map((productId) => ({
    updateOne: {
      filter: {
        _id: productId,
        shopId
      },
      update: {
        $pull: {
          hashtags: { $in: tagIds }
        }
      },
      multi: true
    }
  }));

  const results = await executeBulkOperation(Products, operations, totalProducts);

  return results;
}
