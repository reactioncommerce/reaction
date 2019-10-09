import { decodeCartOpaqueId, decodeFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { decodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import selectFulfillmentOptionForGroupMutation from "../../mutations/selectFulfillmentOptionForGroup.js";

/**
 * @name Mutation/selectFulfillmentOptionForGroup
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the selectFulfillmentOptionForGroup GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The ID of the cart to select a fulfillment option for
 * @param {String} [args.input.cartToken] - The token for the cart, required if it is an anonymous cart
 * @param {String} args.input.fulfillmentGroupId - The group to select a fulfillment option for
 * @param {String} args.input.fulfillmentMethodId - The fulfillment method ID from the option the shopper selected
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} SelectFulfillmentOptionForGroupPayload
 */
export default async function selectFulfillmentOptionForGroup(parentResult, { input }, context) {
  const {
    cartId: opaqueCartId,
    cartToken,
    clientMutationId = null,
    fulfillmentGroupId: opaqueFulfillmentGroupId,
    fulfillmentMethodId: opaqueFulfillmentMethodId
  } = input;

  const cartId = decodeCartOpaqueId(opaqueCartId);
  const fulfillmentGroupId = decodeFulfillmentGroupOpaqueId(opaqueFulfillmentGroupId);
  const fulfillmentMethodId = decodeFulfillmentMethodOpaqueId(opaqueFulfillmentMethodId);

  const { cart } = await selectFulfillmentOptionForGroupMutation(context, {
    cartId,
    cartToken,
    fulfillmentGroupId,
    fulfillmentMethodId
  });

  return {
    cart,
    clientMutationId
  };
}
