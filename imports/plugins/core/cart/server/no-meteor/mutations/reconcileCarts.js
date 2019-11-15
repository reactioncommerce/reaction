import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";
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
 * @return {Promise<Object>} Object in which `cart` property is set to the updated account cart
 */
export default async function reconcileCarts(context, input) {
  const { accountId, collections, user, userId = null } = context;
  const { Cart } = collections;
  const { anonymousCartId, anonymousCartToken } = input;
  // quick solution
  // mode is available in input, but we do not support reconciliation
  // due to not allowing items from different shops
  // and a lot of bikes have quantity 1, which is also not handled by default
  const mode = "keepAccountCart";

  if (!accountId) throw new ReactionError("access-denied", "Access Denied");
  if (!anonymousCartId) throw new ReactionError("invalid-param", "anonymousCartId is required");
  if (!anonymousCartToken) throw new ReactionError("invalid-param", "anonymousCartToken is required");

  const accountCartSelector = { accountId };
  const anonymousCartSelector = { _id: anonymousCartId, anonymousAccessToken: hashLoginToken(anonymousCartToken) };

  const carts = await Cart.find({
    $or: [accountCartSelector, anonymousCartSelector]
  }).toArray();

  const anonymousCart = carts.find((cart) => cart._id === anonymousCartId);
  if (!anonymousCart) throw new ReactionError("not-found", "Anonymous cart not found");

  const { shopId } = anonymousCart;

  // In the Meteor app, there are accounts for anonymous users. This check can be removed someday.
  // Don't use `userHasPermission` for this check because that always returns true if there
  // is "owner" role. We want to know explicitly whether they have the "anonymous" role.
  const roles = (user.roles && user.roles[shopId]) || [];
  if (roles.includes("anonymous")) {
    Logger.warn("reconcileCarts called by an anonymous user. Check client code.");
    throw new ReactionError("access-denied", "Access Denied");
  }

  const accountCart = carts.find((cart) => cart.accountId === accountId && cart.shopId === shopId);

  if (accountCart) {
    // We have both carts, so reconcile them according to "mode"
    switch (mode) {
      case "keepAccountCart":
        return {
          cart: await reconcileCartsKeepAccountCart({ accountCart, anonymousCartSelector, Cart, userId })
        };

      case "keepAnonymousCart":
        return {
          cart: await reconcileCartsKeepAnonymousCart({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, Cart, userId })
        };

      case "merge":
        return {
          cart: await reconcileCartsMerge({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, context, userId })
        };

      default:
        throw new ReactionError("invalid-param", "mode must be keepAccountCart, keepAnonymousCart, or merge");
    }
  }

  // We have only an anonymous cart, so convert it to an account cart
  return {
    cart: await convertAnonymousCartToNewAccountCart({
      accountId,
      anonymousCart,
      anonymousCartSelector,
      Cart,
      shopId,
      userId
    })
  };
}
