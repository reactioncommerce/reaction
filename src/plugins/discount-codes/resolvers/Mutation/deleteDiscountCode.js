import { decodeShopOpaqueId, decodeDiscountCodeOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.deleteDiscountCode
 * @method
 * @memberof Routes/GraphQL
 * @summary Delete a tax rate
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateTagInput
 * @param {String} args.input.discountCodeId - Tax rate ID
 * @param {String} args.input.shopId - Shop ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddTagPayload
 */
export default async function deleteDiscountCode(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    discountCodeId: opaqueDiscountCodeId,
    shopId: opaqueShopId
  } = input;

  const _id = decodeDiscountCodeOpaqueId(opaqueDiscountCodeId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const discountCode = await context.mutations.deleteDiscountCode(context, {
    _id,
    shopId
  });

  return {
    clientMutationId,
    discountCode
  };
}
