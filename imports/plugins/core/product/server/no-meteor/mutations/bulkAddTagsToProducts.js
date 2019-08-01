import Logger from "@reactioncommerce/logger";

const logCtx = { name: "core/product", file: "bulkAddTagsToProducts" };

/**
 *
 * @method bulkAddTagsToProducts
 * @summary Adds an array of tag ids to an array of products looked up by product id.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.productIds - an array of Product IDs
 * @param {String[]} input.tagIds - an array of Tag IDs
 * @return {Object} Object with information of results of bulk the operation
 */
export default async function bulkAddTagsToProducts(context, input) {
  const { productIds, tagIds } = input;
  const { collections: { Products } } = context;
  const bulkOperations = [];
  const totalProductIds = productIds.length;

  // Generate update statements
  for (const productId of productIds) {
    bulkOperations.push({
      updateOne: {
        filter: {
          _id: productId
        },
        update: {
          $addToSet: {
            hashtags: { $each: tagIds }
          }
        }
      }
    });
  }

  let response;
  try {
    Logger.trace({ ...logCtx, bulkOperations }, "Running bulk operation");
    response = await Products.bulkWrite(bulkOperations, { ordered: false });
  } catch (error) {
    Logger.error({ ...logCtx, error }, "One or more of the bulk update failed");
    response = error; // error object has details about failed & successful operations
  }

  const { nMatched, nModified, writeErrors } = response;
  const notFoundCount = totalProductIds - nMatched;

  return {
    foundCount: nMatched,
    notFoundCount,
    updatedCount: nModified,
    writeErrors
  };
}
