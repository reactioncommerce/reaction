import executeBulkOperation from "../utils/executeBulkOperation";

/**
 *
 * @method bulkRemoveTagsFromProducts
 * @summary Removes an array of tag ids to an array of products looked up by product id.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.productIds - an array of Product IDs
 * @param {String[]} input.tagIds - an array of Tag IDs
 * @return {Object} Object with information of results of bulk the operation
 */
export default async function bulkRemoveTagsFromProducts(context, input) {
  const { productIds, tagIds } = input;
  const { collections: { Products } } = context;
  const operations = [];
  const totalProducts = productIds.length;

  // Generate update statements
  for (const productId of productIds) {
    operations.push({
      updateOne: {
        filter: {
          _id: productId
        },
        update: {
          $pull: {
            hashtags: { $in: tagIds }
          }
        },
        multi: true
      }
    });
  }

  const results = executeBulkOperation(Products, operations, totalProducts);

  return results;
}
