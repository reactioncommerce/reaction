import getCartByIdUtil from "../util/getCartById.js";
/**
 * @name getCartById
 * @method
 * @memberof Cart
 * @summary Gets a cart from the db by ID. If there is an account for the request, verifies that the
 *   account has permission to access the cart. Optionally throws an error if not found.
 * @param {Object} context - an object containing the per-request state
 * @param {String} cartId The cart ID
 * @param {Object} [options] Options
 * @param {String} [options.cartToken] Cart token, required if it's an anonymous cart
 * @param {Boolean} [options.throwIfNotFound] Default false. Throw a not-found error rather than return null `cart`
 * @returns {Object|null} The cart document, or null if not found and `throwIfNotFound` was false
 */
export default async function getCartById(context, cartId, { cartToken, throwIfNotFound = false } = {}) {
  return getCartByIdUtil(context, cartId, { cartToken, throwIfNotFound });
}
