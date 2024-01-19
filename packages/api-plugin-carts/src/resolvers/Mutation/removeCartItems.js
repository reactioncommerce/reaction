import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartItemOpaqueId, decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/removeCartItems
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the removeCartItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The ID of the cart in which all of the items exist
 * @param {String[]} args.input.cartItemIds - Array of item IDs to update
 * @param {String} args.input.cartToken - The cartToken if the cart is an anonymous cart
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} RemoveCartItemsPayload
 */
export default async function removeCartItems(parentResult, { input }, context) {
  const { cartId: opaqueCartId, clientMutationId = null, cartItemIds: opaqueCartItemIds, cartToken } = input;

  const cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;
  const cartItemIds = opaqueCartItemIds.map((opaqueCartItemId) => (isOpaqueId(opaqueCartItemId) ? decodeCartItemOpaqueId(opaqueCartItemId) : opaqueCartItemId));

  const { cart } = await context.mutations.removeCartItems(context, {
    cartId,
    cartItemIds,
    cartToken
  });

  return {
    cart,
    clientMutationId
  };
}
