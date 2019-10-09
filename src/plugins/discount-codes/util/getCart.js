import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Gets the current cart.
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId shopId cart belongs to
 * @param {String} [cartId] Limit the search by this cart ID if provided.
 * @param {Object} [options] Options
 * @param {String} [options.cartToken] Cart token, required if it's an anonymous cart
 * @param {Boolean} [options.throwIfNotFound] Default false. Throw a not-found error rather than return null `cart`
 * @returns {Object} A cart object
 */
export default async function getCart(context, shopId, cartId, { cartToken, throwIfNotFound = false } = {}) {
  const { collections, userId } = context;
  const { Accounts, Cart } = collections;

  // set shopId to selector
  const selector = { shopId };

  // if we have a cartId, add it to selector
  if (cartId) {
    selector._id = cartId;
  }

  // if there is a cartToken, the cart is anonymous
  if (cartToken) {
    selector.anonymousAccessToken = hashToken(cartToken);
  } else {
    const account = (userId && await Accounts.findOne({ userId })) || null;

    if (!account) {
      if (throwIfNotFound) {
        Logger.error(`Cart not found for user with ID ${userId}`);
        throw new ReactionError("not-found", "Cart not found");
      }

      return null;
    }

    selector.accountId = account._id;
  }

  const cart = await Cart.findOne(selector) || null;

  if (!cart && throwIfNotFound) {
    Logger.error(`Cart not found for user with ID ${userId}`);
    throw new ReactionError("not-found", "Cart not found");
  }

  return cart;
}
