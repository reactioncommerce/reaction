import updateFulfillmentTypeMutation from "../../mutations/updateFulfillmentType.js";
/**
 * @name Mutation/updateFulfillmentType
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the updateFulfillmentType GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.fulfillmentGroupId - The fulfillment group to be updated
 * @param {String} args.input.shopId - The ShopId to which the fulfillment group belongs
 * @param {String} args.input.name - The fulfillment group name to be updated
 * @param {String} args.input.enabled - Flag to enable/disable group
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentTypePayload
 */
export default async function updateFulfillmentType(parentResult, { input }, context) {
  const { groupInfo } = input;
  const { shopId, fulfillmentGroupId } = groupInfo;

  const { group } = await updateFulfillmentTypeMutation(context, {
    ...groupInfo,
    shopId,
    fulfillmentGroupId
  });

  return {
    group
  };
}
