import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 *
 * @method createProduct
 * @summary initializes empty product template, with empty variant
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String} args.input.shopId - shopId of shop to create product for
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} createProduct payload
 */
export default async function createProduct(_, { input }, context) {
  const {
    clientMutationId = null,
    shopId
  } = input;

  const product = await context.mutations.createProduct(context, {
    shopId: decodeShopOpaqueId(shopId)
  });

  return {
    clientMutationId,
    product
  };
}
