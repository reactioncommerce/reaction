import { Meteor } from "meteor/meteor";
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
 * @returns {Object} An object with `cart` (the cart for the current account)
 *   and `account` (the account document in case the calling code needs it without another request)
 */
export default function getCart(cartId) {
  const userId = Meteor.userId();
  const account = (userId && Accounts.findOne({ userId })) || null;

  const shopId = Reaction.getCartShopId();

  if ((!account && !cartId) || !shopId) return { account, cart: null };

  const selector = { shopId };
  if (cartId) selector._id = cartId;
  if (account) selector.accountId = account._id;

  return {
    account,
    cart: Cart.findOne(selector) || null
  };
}
