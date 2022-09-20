import { decodeShopOpaqueId, decodeTaxRateOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.deleteTaxRate
 * @method
 * @memberof Routes/GraphQL
 * @summary Delete a tax rate
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateTagInput
 * @param {String} args.input.taxRateId - Tax rate ID
 * @param {String} args.input.shopId - Shop ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddTagPayload
 */
export default async function deleteTaxRate(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    taxRateId: opaqueTaxRateId,
    shopId: opaqueShopId
  } = input;

  const _id = decodeTaxRateOpaqueId(opaqueTaxRateId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const taxRate = await context.mutations.deleteTaxRate(context, {
    _id,
    shopId
  });

  return {
    clientMutationId,
    taxRate
  };
}
