import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method updateProductsVisibility
 * @summary Updates a set a products visibility
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.productIds - an array of Product IDs
 * @param {String} input.shopId - the shop's id
 * @param {String[]} input.isVisible - the desired visibility
 * @return {Number} A count of how many documents were successfully updated
 */
export default async function updateProductsVisibility(context, input) {
  const { productIds, shopId, isVisible } = input;
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
        $set: {
          isVisible
        }
      }
    }
  }));

  const results = await executeBulkOperation(Products, operations, totalProducts);

  return results;
}
