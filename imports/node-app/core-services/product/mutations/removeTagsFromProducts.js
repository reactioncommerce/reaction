import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import executeBulkOperation from "../utils/executeBulkOperation.js";

/**
 *
 * @method removeTagsFromProducts
 * @summary Removes an array of tag ids to an array of products looked up by product id.
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String[]} input.productIds - an array of Product IDs
 * @param {String[]} input.tagIds - an array of Tag IDs
 * @return {Object} Object with information of results of bulk the operation
 */
export default async function removeTagsFromProducts(context, input) {
  const { productIds, tagIds: opaqueTagIds } = input;
  const { collections: { Products } } = context;
  const tagIds = opaqueTagIds.map(decodeTagOpaqueId);
  const totalProducts = productIds.length;

  // Generate update statements
  const operations = productIds.map((productId) => ({
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
  }));

  const results = await executeBulkOperation(Products, operations, totalProducts);

  return results;
}
