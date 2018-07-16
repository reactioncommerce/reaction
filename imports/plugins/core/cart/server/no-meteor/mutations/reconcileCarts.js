import { Meteor } from "meteor/meteor";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";
import convertAnonymousCartToNewAccountCart from "./convertAnonymousCartToNewAccountCart";
import reconcileCartsKeepAccountCart from "./reconcileCartsKeepAccountCart";
import reconcileCartsKeepAnonymousCart from "./reconcileCartsKeepAnonymousCart";
import reconcileCartsMerge from "./reconcileCartsMerge";

/**
 * @method reconcileCarts
 * @summary Call this with account credentials, passing in an anonymous cart, and the
 *   anonymous cart will be merged into the account cart. The "mode" argument allows
 *   you to specify whether the items should be merged, or if items should be kept from
 *   just one of the carts. If this mutation does not throw an error, the anonymous cart
 *   will be destroyed by the time this function returns.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {String} input.anonymousCartId - The anonymous cart ID
 * @param {String} input.anonymousCartToken - The anonymous cart token
 * @param {String} [input.mode] - The reconciliation mode, "merge", "keepAccountCart", or "keepAnonymousCart". Default "merge"
 * @param {String} shopId - The ID of the shop that owns both carts
 * @return {Promise<Object>} Object in which `cart` property is set to the updated account cart
 */
export default async function reconcileCarts(context, input) {
  const { accountId, collections } = context;
  const { Cart } = collections;
  const { anonymousCartId, anonymousCartToken, mode = "merge", shopId } = input;

  if (!accountId) throw new Meteor.Error("access-denied", "Access Denied");
  if (!anonymousCartId) throw new Meteor.Error("invalid-param", "anonymousCartId is required");
  if (!anonymousCartToken) throw new Meteor.Error("invalid-param", "anonymousCartToken is required");
  if (!shopId) throw new Meteor.Error("invalid-param", "shopId is required");

  const accountCartSelector = { accountId, shopId };
  const anonymousCartSelector = { _id: anonymousCartId, shopId, token: hashLoginToken(anonymousCartToken) };

  const carts = await Cart.find({
    $or: [accountCartSelector, anonymousCartSelector]
  }).toArray();

  const anonymousCart = carts.find((cart) => cart._id === anonymousCartId);
  if (!anonymousCart) throw new Meteor.Error("not-found", "Anonymous cart not found");

  const accountCart = carts.find((cart) => cart.accountId === accountId);

  if (accountCart) {
    // We have both carts, so reconcile them according to "mode"
    switch (mode) {
      case "keepAccountCart":
        return {
          cart: await reconcileCartsKeepAccountCart({ accountCart, anonymousCartSelector, Cart })
        };

      case "keepAnonymousCart":
        return {
          cart: await reconcileCartsKeepAnonymousCart({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, Cart })
        };

      case "merge":
        return {
          cart: await reconcileCartsMerge({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, collections })
        };

      default:
        throw new Meteor.Error("invalid-param", "mode must be keepAccountCart, keepAnonymousCart, or merge");
    }
  }

  // We have only an anonymous cart, so convert it to an account cart
  return {
    cart: await convertAnonymousCartToNewAccountCart({ accountId, anonymousCart, anonymousCartSelector, Cart, shopId })
  };
}
