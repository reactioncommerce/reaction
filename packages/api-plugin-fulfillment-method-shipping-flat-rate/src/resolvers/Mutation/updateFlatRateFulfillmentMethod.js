import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeFulfillmentMethodOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";
import updateFlatRateFulfillmentMethodMutation from "../../mutations/updateFlatRateFulfillmentMethod.js";

/**
 * @name Mutation/updateFlatRateFulfillmentMethod
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the updateFlatRateFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.methodId - The ID of the method you want to update
 * @param {Object} args.input.method - The full updated method object, without ID
 * @param {String} args.input.shopId - The shop to update this flat rate fulfillment method for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateFlatRateFulfillmentMethodPayload
 */
export default async function updateFlatRateFulfillmentMethod(parentResult, { input }, context) {
  const { clientMutationId = null, method, methodId: opaqueMethodId, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const methodId = isOpaqueId(opaqueMethodId) ? decodeFulfillmentMethodOpaqueId(opaqueMethodId) : opaqueMethodId;

  const { method: updatedMethod } = await updateFlatRateFulfillmentMethodMutation(context, {
    method,
    methodId,
    shopId
  });

  return {
    clientMutationId,
    method: updatedMethod
  };
}
