import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.createDiscountCode
 * @method
 * @memberof DiscountCodes/GraphQL
 * @summary Create a discount code
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateDiscountCodeInput
 * @param {String} args.input.shopId - Shop ID
 * @param {Object} args.input.discountCode - DiscountCodeInput
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateDiscountCodePayload
 */
export default async function createDiscountCode(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    shopId: opaqueShopId,
    discountCode: discountCodeInput
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const discountCode = await context.mutations.createDiscountCode(context, {
    shopId,
    ...discountCodeInput
  });

  return {
    clientMutationId,
    discountCode
  };
}
