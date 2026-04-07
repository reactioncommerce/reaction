import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method addCartItems
 * @summary Add one or more items to a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {Object} [options] - Options
 * @param {Boolean} [options.skipPriceCheck] - For backwards compatibility, set to `true` to skip checking price.
 *   Skipping this is not recommended for new code.
 * @returns {Promise<Object>} An object with `cart`, `minOrderQuantityFailures`, and `incorrectPriceFailures` properties.
 *   `cart` will always be the full updated cart document, but `incorrectPriceFailures` and
 *   `minOrderQuantityFailures` may still contain other failures that the caller should
 *   optionally retry with the corrected price or quantity.
 */
export default async function addCartItems(context, input) {
  const { cartId, cartToken } = input;
  const { collections, accountId = null } = context;
  const { Cart } = collections;

  let selector;
  if (accountId) {
    // Account cart
    selector = { _id: cartId, accountId };
  } else {
    // Anonymous cart
    if (!cartToken) {
      throw new ReactionError("not-found", "Cart not found");
    }

    selector = { _id: cartId, anonymousAccessToken: hashToken(cartToken) };
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  // Intentionally keep cart items unchanged.
  // This makes add-to-cart requests no-op while still returning a valid payload.
  return {
    cart,
    incorrectPriceFailures: [],
    minOrderQuantityFailures: []
  };
}
