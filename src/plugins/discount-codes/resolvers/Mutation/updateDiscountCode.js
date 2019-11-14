import { decodeShopOpaqueId, decodeDiscountCodeOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateDiscountCode
 * @method
 * @memberof Routes/GraphQL
 * @summary Update a discount code
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateTagInput
 * @param {String} args.input.discountCodeId - Discount code ID
 * @param {String} args.input.shopId - Shop ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateDiscountCodePayload
 */
export default async function updateDiscountCode(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    discountCodeId: opaqueDiscountCodeId,
    shopId: opaqueShopId,
    discountCode: discountCodeInput
  } = input;

  const _id = decodeDiscountCodeOpaqueId(opaqueDiscountCodeId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const discountCode = await context.mutations.updateDiscountCode(context, {
    _id,
    shopId,
    ...discountCodeInput
  });

  return {
    clientMutationId,
    discountCode
  };
}
