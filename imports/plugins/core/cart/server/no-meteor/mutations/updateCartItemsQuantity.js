import Logger from "@reactioncommerce/logger";

/**
 * @method updateCartItemsQuantity
 * @summary Sets a new quantity for one or more items in a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Necessary input
 * @param {String} input.cartId - The ID of the cart in which all of the items exist
 * @param {String} input.items - Array of items to update
 * @param {Number} input.items.cartItemId - The cart item ID
 * @param {Object} input.items.quantity - The new quantity, which must be an integer of 0 or greater
 * @param {String} input.token - The token if the cart is an anonymous cart
 * @return {Promise<Object>} And object containing the updated cart in a `cart` property
 */
export default async function updateCartItemsQuantity(context, input) {
  Logger.info("updateCartItemsQuantity mutation is not yet implemented");
  return null;
}
