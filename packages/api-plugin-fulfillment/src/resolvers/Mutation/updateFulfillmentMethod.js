import { decodeShopOpaqueId, decodeFulfillmentGroupOpaqueId, decodeFulfillmentMethodOpaqueId } from "../../xforms/id.js";
import updateFulfillmentMethodMutation from "../../mutations/updateFulfillmentMethod.js";
/**
 * @name Mutation/updateFulfillmentMethod
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the updateFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.fulfillmentTypeId - The fulfillment type to be updated
 * @param {String} args.input.methodId - The fulfillment method to be updated
 * @param {String} args.input.shopId - The ShopId to which the fulfillment group belongs
 * @param {String} args.input.method - The fulfillment method data to be updated
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentMethodPayload
 */
export default async function updateFulfillmentMethod(parentResult, { input }, context) {
  const { shopId: opaqueShopId, clientMutationId = null, fulfillmentTypeId: opaqueFulfillmentTypeId, methodId: opaqueMethodId, method } = input;

  const methodId = decodeFulfillmentMethodOpaqueId(opaqueMethodId);
  const fulfillmentTypeId = decodeFulfillmentGroupOpaqueId(opaqueFulfillmentTypeId);
  const shopId = decodeShopOpaqueId(opaqueShopId);
  const { group } = await updateFulfillmentMethodMutation(context, {
    shopId,
    fulfillmentTypeId,
    methodId,
    method
  });

  return {
    group,
    clientMutationId
  };
}
