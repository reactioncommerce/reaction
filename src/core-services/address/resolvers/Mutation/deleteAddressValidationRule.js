import { decodeAddressValidationRuleOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.deleteAddressValidationRule
 * @method
 * @memberof Routes/GraphQL
 * @summary Delete an address validation rule
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateAddressValidationRuleInput
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateAddressValidationRulePayload
 */
export default async function deleteAddressValidationRule(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    ruleId: opaqueRuleId,
    shopId: opaqueShopId
  } = input;

  const _id = decodeAddressValidationRuleOpaqueId(opaqueRuleId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const addressValidationRule = await context.mutations.deleteAddressValidationRule(context, {
    _id,
    shopId
  });

  return {
    addressValidationRule,
    clientMutationId
  };
}
