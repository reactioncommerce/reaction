import { decodeAddressValidationRuleOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateAddressValidationRule
 * @method
 * @memberof Routes/GraphQL
 * @summary Update an address validation rule
 * @param {Object} parentResult - unused
 * @param {Object} args.input - UpdateAddressValidationRuleInput
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateAddressValidationRulePayload
 */
export default async function updateAddressValidationRule(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    ruleId: opaqueRuleId,
    shopId: opaqueShopId,
    ...otherInput
  } = input;

  const _id = decodeAddressValidationRuleOpaqueId(opaqueRuleId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const addressValidationRule = await context.mutations.updateAddressValidationRule(context, {
    ...otherInput,
    _id,
    shopId
  });

  return {
    addressValidationRule,
    clientMutationId
  };
}
