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
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentMethodPayload
 */
export default async function updateFulfillmentMethod(parentResult, { input }, context) {
  const { shopId, fulfillmentTypeId, methodId, method } = input.groupInfo;

  const { method: updatedMethod } = await updateFulfillmentMethodMutation(context, {
    shopId,
    fulfillmentTypeId,
    methodId,
    method
  });

  return {
    method: updatedMethod
  };
}
