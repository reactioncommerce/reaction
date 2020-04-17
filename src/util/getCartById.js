import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Gets a cart from the db by ID. If there is an account for the request, verifies that the
 *   account has permission to access the cart. Optionally throws an error if not found.
 * @param {Object} context Object defining the request state
 * @param {String} cartId The cart ID
 * @param {Object} [options] Options
 * @param {String} [options.cartToken] Cart token, required if it's an anonymous cart
 * @param {Boolean} [options.throwIfNotFound] Default false. Throw a not-found error rather than return null `cart`
 * @returns {Object|null} The cart document, or null if not found and `throwIfNotFound` was false
 */
export default async function getCartById(context, cartId, { cartToken, throwIfNotFound = false } = {}) {
  const { accountId, collections } = context;
  const { Cart } = collections;

  const selector = { _id: cartId };

  if (cartToken) {
    selector.anonymousAccessToken = hashToken(cartToken);
  }

  const cart = await Cart.findOne(selector);
  if (!cart && throwIfNotFound) {
    throw new ReactionError("not-found", "Cart not found");
  }

  if (cart && cart.accountId && cart.accountId !== accountId) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  return cart || null;
}
