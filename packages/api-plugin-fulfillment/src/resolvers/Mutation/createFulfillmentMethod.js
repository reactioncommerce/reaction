import { decodeShopOpaqueId, decodeFulfillmentGroupOpaqueId } from "../../xforms/id.js";
import createFulfillmentMethodMutation from "../../mutations/createFulfillmentMethod.js";

/**
 * @name Mutation/createFulfillmentMethod
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the createFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentTypePayload
 */
export default async function createFulfillmentMethod(parentResult, { input }, context) {
  const { groupInfo, clientMutationId = null } = input;
  const { shopId: opaqueShopId, fulfillmentTypeId: opaqueFulfillmentTypeId, method } = groupInfo;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const fulfillmentTypeId = decodeFulfillmentGroupOpaqueId(opaqueFulfillmentTypeId);
  const { group } = await createFulfillmentMethodMutation(context, {
    method,
    fulfillmentTypeId,
    shopId
  });

  return {
    group,
    clientMutationId
  };
}
