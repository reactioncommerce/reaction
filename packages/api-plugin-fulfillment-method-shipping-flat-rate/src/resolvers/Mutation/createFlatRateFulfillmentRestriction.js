import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeFulfillmentMethodOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";
import createFlatRateFulfillmentRestrictionMutation from "../../mutations/createFlatRateFulfillmentRestriction.js";

/**
 * @name Mutation/createFlatRateFulfillmentMethod
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the createFlatRateFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.restriction - The restriction object
 * @param {String} args.input.shopId - The shop to create this flat rate fulfillment method for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateFlatRateFulfillmentMethodPayload
 */
export default async function createFlatRateFulfillmentRestriction(parentResult, { input }, context) {
  const { clientMutationId = null, restriction, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  let decodedMethodIds = [];
  if (restriction.methodIds && Array.isArray(restriction.methodIds)) {
    decodedMethodIds = restriction.methodIds.map((methodId) => (isOpaqueId(methodId) ? decodeFulfillmentMethodOpaqueId(methodId) : methodId));
  }

  restriction.methodIds = decodedMethodIds;

  const { restriction: insertedRestriction } = await createFlatRateFulfillmentRestrictionMutation(context, {
    restriction,
    shopId
  });

  return {
    clientMutationId,
    restriction: insertedRestriction
  };
}
