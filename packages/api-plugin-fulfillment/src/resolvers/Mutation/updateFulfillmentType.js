import updateFulfillmentTypeMutation from "../../mutations/updateFulfillmentType.js";
/**
 * @name Mutation/updateFulfillmentType
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the updateFulfillmentType GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.fulfillmentTypeInfo.fulfillmentTypeId - The id of the fulfillment type to be updated
 * @param {String} args.input.fulfillmentTypeInfo.shopId - The ShopId to which the fulfillment type belongs
 * @param {String} args.input.fulfillmentTypeInfo.name - The name of fulfillment type to be updated
 * @param {String} args.input.fulfillmentTypeInfo.enabled - Flag to enable/disable type
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentTypePayload
 */
export default async function updateFulfillmentType(parentResult, { input }, context) {
  const { fulfillmentTypeInfo } = input;
  const { shopId, fulfillmentTypeId } = fulfillmentTypeInfo;

  const { fulfillmentType } = await updateFulfillmentTypeMutation(context, {
    ...fulfillmentTypeInfo,
    shopId,
    fulfillmentTypeId
  });

  return {
    fulfillmentType
  };
}
