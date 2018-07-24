import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { Cart as CartSchema } from "/imports/collections/schemas";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";
import addCartItemsUtil from "../util/addCartItems";

/**
 * @method addCartItems
 * @summary Add one or more items to a cart
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - AddCartItemsInput object
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
  const { collections, accountId = null } = context;
  const { Cart } = collections;

  let selector;
  if (accountId) {
    // Account cart
    selector = { _id: cartId, accountId };
  } else {
    // Anonymous cart
    if (!token) {
      throw new Meteor.Error("not-found", "Cart not found");
    }

    selector = { _id: cartId, anonymousAccessToken: hashLoginToken(token) };
  }

  const cart = await Cart.findOne(selector);
  if (!cart) {
    throw new Meteor.Error("not-found", "Cart not found");
  }

  const {
    incorrectPriceFailures,
    minOrderQuantityFailures,
    updatedItemList
  } = await addCartItemsUtil(collections, cart.items, items, { skipPriceCheck: options.skipPriceCheck });

  const updatedAt = new Date();

  const modifier = {
    $set: {
      items: updatedItemList,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { modifiedCount } = await Cart.updateOne({
    _id: cart._id
  }, modifier);

  if (modifiedCount !== 1) throw new Meteor.Error("server-error", "Unable to update cart");

  const updatedCart = {
    ...cart,
    items: updatedItemList,
    updatedAt
  };
  Hooks.Events.run("afterCartUpdate", cart._id, updatedCart);
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  return { cart: updatedCart, incorrectPriceFailures, minOrderQuantityFailures };
}
