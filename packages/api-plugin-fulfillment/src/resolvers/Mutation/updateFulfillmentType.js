import { decodeShopOpaqueId, decodeFulfillmentGroupOpaqueId } from "../../xforms/id.js";
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
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentTypePayload
 */
export default async function updateFulfillmentType(parentResult, { input }, context) {
  const { groupInfo, clientMutationId = null } = input;
  const { shopId: opaqueShopId, fulfillmentGroupId: opaqueFulfillmentGroupId } = groupInfo;

  const fulfillmentGroupId = decodeFulfillmentGroupOpaqueId(opaqueFulfillmentGroupId);
  const shopId = decodeShopOpaqueId(opaqueShopId);
  const { group } = await updateFulfillmentTypeMutation(context, {
    ...groupInfo,
    shopId,
    fulfillmentGroupId
  });

  return {
    group,
    clientMutationId
  };
}
