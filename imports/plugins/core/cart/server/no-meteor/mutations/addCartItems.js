import ReactionError from "@reactioncommerce/reaction-error";
import { Cart as CartSchema } from "/imports/collections/schemas";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";
import addCartItemsUtil from "../util/addCartItems";

/**
 * @method addCartItems
 * @summary Add one or more items to a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {Object} [options] - Options
 * @param {Boolean} [options.skipPriceCheck] - For backwards compatibility, set to `true` to skip checking price.
 *   Skipping this is not recommended for new code.
 * @return {Promise<Object>} An object with `cart`, `minOrderQuantityFailures`, and `incorrectPriceFailures` properties.
 *   `cart` will always be the full updated cart document, but `incorrectPriceFailures` and
 *   `minOrderQuantityFailures` may still contain other failures that the caller should
 *   optionally retry with the corrected price or quantity.
 */
export default async function addCartItems(context, input, options = {}) {
  const { cartId, items, token } = input;
  const { appEvents, collections, queries, accountId = null, userId = null } = context;
  const { Cart } = collections;

  let selector;
  if (accountId) {
    // Account cart
    selector = { _id: cartId, accountId };
  } else {
    // Anonymous cart
    if (!token) {
      throw new ReactionError("not-found", "Cart not found");
    }

    selector = { _id: cartId, anonymousAccessToken: hashLoginToken(token) };
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    throw new ReactionError("not-found", "Cart not found");
  }

  const {
    incorrectPriceFailures,
    minOrderQuantityFailures,
    updatedItemList
  } = await addCartItemsUtil(context, cart.items, items, { skipPriceCheck: options.skipPriceCheck });

  const updatedAt = new Date();

  const modifier = {
    $set: {
      items: updatedItemList,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { matchedCount } = await Cart.updateOne({ _id: cart._id }, modifier);
  if (matchedCount !== 1) throw new ReactionError("server-error", "Unable to update cart");

  const updatedCart = {
    ...cart,
    items: updatedItemList,
    updatedAt
  };
  await appEvents.emit("afterCartUpdate", {
    cart: updatedCart,
    updatedBy: userId
  });

  return { cart: updatedCart, incorrectPriceFailures, minOrderQuantityFailures };
}
