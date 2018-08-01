import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import ReactionError from "/imports/plugins/core/graphql/lib/ReactionError";
import { Accounts, Cart } from "/lib/collections";

let Reaction;

if (Meteor.isClient) {
  ({ Reaction } = require("/client/api"));
} else {
  Reaction = require("/imports/plugins/core/core/server/Reaction").default;
}

/**
 * @summary Gets the current cart. Assumes a calling context where Meteor.userId() works. It works
 *   in all client code, in server methods, and in server publications.
 * @param {String} [cartId] Limit the search by this cart ID if provided.
 * @param {Object} [options] Options
 * @param {Boolean} [options.throwIfNotFound] Default false. Throw a not-found error rather than return null `cart`
 * @returns {Object} An object with `cart` (the cart for the current account)
 *   and `account` (the account document in case the calling code needs it without another request)
 */
export default function getCart(cartId, { throwIfNotFound = false } = {}) {
  const userId = Meteor.userId();
  const account = (userId && Accounts.findOne({ userId })) || null;

  const shopId = Reaction.getCartShopId();

  if ((!account && !cartId) || !shopId) {
    if (throwIfNotFound) {
      Logger.error(`Cart not found for user with ID ${userId}`);
      throw new ReactionError("not-found", "Cart not found");
    }

    return { account, cart: null };
  }

  const selector = { shopId };
  if (cartId) selector._id = cartId;
  if (account) selector.accountId = account._id;

  const cart = Cart.findOne(selector) || null;

  if (!cart && throwIfNotFound) {
    Logger.error(`Cart not found for user with ID ${userId}`);
    throw new ReactionError("not-found", "Cart not found");
  }

  return { account, cart };
}
