import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { decodeFulfillmentRestrictionOpaqueId } from "../../xforms/flatRateFulfillmentRestriction.js";
import updateFlatRateFulfillmentRestrictionMutation from "../../mutations/updateFlatRateFulfillmentRestriction.js";

/**
 * @name Mutation/updateFlatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the updateFlatRateFulfillmentRestriction GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.restrictionId - The ID of the restriction you want to update
 * @param {Object} args.input.restriction - The full updated restriction object, without ID
 * @param {String} args.input.shopId - The shop to update this flat rate fulfillment restriction for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFlatRateFulfillmentRestrictionPayload
 */
export default async function updateFlatRateFulfillmentRestriction(parentResult, { input }, context) {
  const { clientMutationId = null, restriction, restrictionId: opaqueRestrictionId, shopId: opaqueShopId } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const restrictionId = decodeFulfillmentRestrictionOpaqueId(opaqueRestrictionId);

  let decodedMethodIds = [];
  if (restriction.methodIds && Array.isArray(restriction.methodIds)) {
    decodedMethodIds = restriction.methodIds.map((methodId) => decodeFulfillmentMethodOpaqueId(methodId));
  }

  restriction.methodIds = decodedMethodIds;

  const { restriction: updatedRestriction } = await updateFlatRateFulfillmentRestrictionMutation(context, {
    restriction,
    restrictionId,
    shopId
  });

  return {
    clientMutationId,
    restriction: updatedRestriction
  };
}
