import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeFulfillmentRestrictionOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";
import deleteFlatRateFulfillmentRestrictionMutation from "../../mutations/deleteFlatRateFulfillmentRestriction.js";

/**
 * @name Mutation/deleteFlatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the deleteFlatRateFulfillmentRestriction GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.restrictionId - The ID of the restriction you want to delete
 * @param {String} args.input.shopId - The shop to delete this restriction for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} DeleteFlatRateFulfillmentRestrictionPayload
 */
export default async function deleteFlatRateFulfillmentRestriction(parentResult, { input }, context) {
  const { clientMutationId = null, restrictionId: opaqueRestrictionId, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const restrictionId = isOpaqueId(opaqueRestrictionId) ? decodeFulfillmentRestrictionOpaqueId(opaqueRestrictionId) : opaqueRestrictionId;

  const { restriction } = await deleteFlatRateFulfillmentRestrictionMutation(context, {
    restrictionId,
    shopId
  });

  return {
    clientMutationId,
    restriction
  };
}
