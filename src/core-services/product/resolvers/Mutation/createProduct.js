import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method createProduct
 * @summary initializes empty product template, with empty variant
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} [args.input.clientMutationId] - The mutation id
 * @param {String} [args.input.product] - product data
 * @param {Boolean} [input.shouldCreateFirstVariant] - Auto-create one variant for the product
 * @param {String} args.input.shopId - shopId of shop to create product for
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} createProduct payload
 */
export default async function createProduct(_, { input }, context) {
  const {
    clientMutationId = null,
    product: productInput,
    shopId,
    shouldCreateFirstVariant
  } = input;

  if (productInput && Array.isArray(productInput.tagIds)) {
    productInput.hashtags = productInput.tagIds.map(decodeTagOpaqueId);
    delete productInput.tagIds;
  }

  const product = await context.mutations.createProduct(context, {
    product: productInput,
    shopId: decodeShopOpaqueId(shopId),
    shouldCreateFirstVariant
  });

  return {
    clientMutationId,
    product
  };
}
