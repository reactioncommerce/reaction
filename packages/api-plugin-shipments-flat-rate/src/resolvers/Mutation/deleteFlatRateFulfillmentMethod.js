import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeFulfillmentMethodOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";
import deleteFlatRateFulfillmentMethodMutation from "../../mutations/deleteFlatRateFulfillmentMethod.js";

/**
 * @name Mutation/deleteFlatRateFulfillmentMethod
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the deleteFlatRateFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.methodId - The ID of the method you want to delete
 * @param {String} args.input.shopId - The shop to delete this flat rate fulfillment method for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} DeleteFlatRateFulfillmentMethodPayload
 */
export default async function deleteFlatRateFulfillmentMethod(parentResult, { input }, context) {
  const { clientMutationId = null, methodId: opaqueMethodId, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const methodId = isOpaqueId(opaqueMethodId) ? decodeFulfillmentMethodOpaqueId(opaqueMethodId) : opaqueMethodId;

  const { method } = await deleteFlatRateFulfillmentMethodMutation(context, {
    methodId,
    shopId
  });

  return {
    clientMutationId,
    method
  };
}
