import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartItemOpaqueId, decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/updateCartItemsQuantity
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the updateCartItemsQuantity GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The ID of the cart in which all of the items exist
 * @param {String} args.input.items - Array of items to update
 * @param {Number} args.input.items.cartItemId - The cart item ID
 * @param {Object} args.input.items.quantity - The new quantity, which must be an integer of 0 or greater
 * @param {String} args.input.cartToken - The cartToken if the cart is an anonymous cart
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateCartItemsQuantityPayload
 */
export default async function updateCartItemsQuantity(parentResult, { input }, context) {
  const { cartId: opaqueCartId, clientMutationId = null, items: itemsInput, cartToken } = input;

  const cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;
  const items = itemsInput.map((item) => ({
    cartItemId: isOpaqueId(item.cartItemId) ? decodeCartItemOpaqueId(item.cartItemId) : item.cartItemId,
    quantity: item.quantity
  }));

  const { cart } = await context.mutations.updateCartItemsQuantity(context, {
    cartId,
    items,
    cartToken
  });

  return { cart, clientMutationId };
}
