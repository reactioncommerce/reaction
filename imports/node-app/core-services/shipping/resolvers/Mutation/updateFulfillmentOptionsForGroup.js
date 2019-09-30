import { decodeCartOpaqueId, decodeFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import updateFulfillmentOptionsForGroupMutation from "../../mutations/updateFulfillmentOptionsForGroup.js";

/**
 * @name Mutation/updateFulfillmentOptionsForGroup
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the updateFulfillmentOptionsForGroup GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The ID of the cart to update fulfillment options for
 * @param {String} [args.input.cartToken] - The token for the cart, required if it is an anonymous cart
 * @param {String} args.input.fulfillmentGroupId - The group to update fulfillment options for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateFulfillmentOptionsForGroupPayload
 */
export default async function updateFulfillmentOptionsForGroup(parentResult, { input }, context) {
  const { cartId: opaqueCartId, cartToken, clientMutationId = null, fulfillmentGroupId: opaqueFulfillmentGroupId } = input;

  const fulfillmentGroupId = decodeFulfillmentGroupOpaqueId(opaqueFulfillmentGroupId);
  const cartId = decodeCartOpaqueId(opaqueCartId);

  const { cart } = await updateFulfillmentOptionsForGroupMutation(context, {
    cartId,
    cartToken,
    fulfillmentGroupId
  });

  return {
    cart,
    clientMutationId
  };
}
