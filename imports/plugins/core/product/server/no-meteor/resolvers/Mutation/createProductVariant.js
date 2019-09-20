import { decodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";

/**
 *
 * @method createProductVariant
 * @summary initializes empty variant template
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.productId - the product or variant ID which we create new variant on
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} createProductVariant payload
 */
export default async function createProductVariant(_, { input }, context) {
  const {
    clientMutationId = null,
    productId
  } = input;

  const variant = await context.mutations.createProductVariant(context, {
    productId: decodeProductOpaqueId(productId)
  });

  return {
    clientMutationId,
    variant
  };
}
