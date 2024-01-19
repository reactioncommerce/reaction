import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId, decodeTaxRateOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateTaxRate
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateTagInput
 * @param {String} args.input.taxRateId - Tax rate ID
 * @param {String} args.input.shopId - Shop ID
 * @param {String} args.input.taxRate - Tax rate fields to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateTaxRatePayload
 */
export default async function updateTaxRate(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    taxRateId: opaqueTaxRateId,
    shopId: opaqueShopId,
    ...taxRateInput
  } = input;

  const _id = isOpaqueId(opaqueTaxRateId) ? decodeTaxRateOpaqueId(opaqueTaxRateId) : opaqueTaxRateId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const taxRate = await context.mutations.updateTaxRate(context, {
    _id,
    shopId,
    ...taxRateInput
  });

  return {
    clientMutationId,
    taxRate
  };
}
