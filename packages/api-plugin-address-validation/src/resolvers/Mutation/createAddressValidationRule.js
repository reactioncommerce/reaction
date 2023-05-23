import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.createAddressValidationRule
 * @method
 * @memberof Routes/GraphQL
 * @summary Create an address validation rule
 * @param {Object} parentResult - unused
 * @param {Object} args.input - CreateAddressValidationRuleInput
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateAddressValidationRulePayload
 */
export default async function createAddressValidationRule(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    shopId: opaqueShopId,
    ...otherInput
  } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const addressValidationRule = await context.mutations.createAddressValidationRule(context, {
    ...otherInput,
    shopId
  });

  return {
    addressValidationRule,
    clientMutationId
  };
}
