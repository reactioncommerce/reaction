import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";
import { Accounts, Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @summary Gets the current cart. Assumes a calling context where logged in userID can be retrieved. It works
 *   in all client code, in server methods, and in server publications.
 * @param {String} [cartId] Limit the search by this cart ID if provided.
 * @param {Object} [options] Options
 * @param {String} [options.cartToken] Cart token, required if it's an anonymous cart
 * @param {Boolean} [options.throwIfNotFound] Default false. Throw a not-found error rather than return null `cart`
 * @returns {Object} An object with `cart` (the cart for the current account)
 *   and `account` (the account document in case the calling code needs it without another request)
 */
export default function getCart(cartId, { cartToken, throwIfNotFound = false } = {}) {
  const shopId = Reaction.getCartShopId();
  if (!shopId) {
    throw new Meteor.Error("not-found", "Cart not found");
  }

  const userId = Reaction.getUserId();
  let account = null;
  const selector = { shopId };
  if (cartId) {
    selector._id = cartId;
  }

  if (cartToken) {
    selector.anonymousAccessToken = hashToken(cartToken);
  } else {
    account = (userId && Accounts.findOne({ userId })) || null;

    if (!account) {
      if (throwIfNotFound) {
        Logger.error(`Cart not found for user with ID ${userId}`);
        throw new ReactionError("not-found", "Cart not found");
      }

      return { account, cart: null };
    }

    selector.accountId = account._id;
  }

  const cart = Cart.findOne(selector) || null;

  if (!cart && throwIfNotFound) {
    Logger.error(`Cart not found for user with ID ${userId}`);
    throw new ReactionError("not-found", "Cart not found");
  }

  return { account, cart };
}
