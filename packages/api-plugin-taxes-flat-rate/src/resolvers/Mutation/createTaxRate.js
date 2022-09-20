import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.createTaxRate
 * @method
 * @memberof Routes/GraphQL
 * @summary Create a tax rate
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateTagInput
 * @param {String} args.input.shopId - Shop ID
 * @param {String} args.input.taxRate - Tax rate fields to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateTaxRatePayload
 */
export default async function createTaxRate(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    shopId: opaqueShopId,
    ...taxRateInput
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const taxRate = await context.mutations.createTaxRate(context, {
    shopId,
    ...taxRateInput
  });

  return {
    clientMutationId,
    taxRate
  };
}
