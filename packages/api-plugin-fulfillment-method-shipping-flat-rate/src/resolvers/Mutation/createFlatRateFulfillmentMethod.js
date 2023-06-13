import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";
import createFlatRateFulfillmentMethodMutation from "../../mutations/createFlatRateFulfillmentMethod.js";

/**
 * @name Mutation/createFlatRateFulfillmentMethod
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the createFlatRateFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.method - The method object
 * @param {String} args.input.shopId - The shop to create this flat rate fulfillment method for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateFlatRateFulfillmentMethodPayload
 */
export default async function createFlatRateFulfillmentMethod(parentResult, { input }, context) {
  const { clientMutationId = null, method, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const { method: insertedMethod } = await createFlatRateFulfillmentMethodMutation(context, {
    method,
    shopId
  });

  return {
    clientMutationId,
    method: insertedMethod
  };
}
