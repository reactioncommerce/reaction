import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import updateCartItemsQuantity from "../no-meteor/mutations/updateCartItemsQuantity";

/**
 * @method cart/removeFromCart
 * @memberof Cart/Methods
 * @summary Removes or adjust quantity of a variant from the cart
 * @param {String} cartId - Cart ID
 * @param {String} [cartToken] - Token for cart, if it's anonymous
 * @param {String} cartItemId - cart item _id
 * @param {Number} [quantityDecrement] - if provided will decrement quantity by quantityDecrement
 * @returns {Object} An object with `cart` property set to the updated Cart document
 */
export default function removeFromCart(cartId, cartToken, cartItemId, quantityDecrement) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));
  check(cartItemId, String);
  check(quantityDecrement, Match.Optional(Number));

  const { cart } = getCart(null, { cartToken, throwIfNotFound: true });
  const { shopId } = cart;
  let cartItem;

  if (Array.isArray(cart.items)) {
    cartItem = cart.items.find((item) => item._id === cartItemId);
  }

  // extra check of item exists
  if (!cartItem) {
    Logger.error(`Unable to find an item: ${cartItemId} within the cart: ${cart._id}`);
    throw new ReactionError("not-found", "Unable to find an item with such ID in cart.");
  }

  let quantity;
  if (!quantityDecrement || quantityDecrement >= cartItem.quantity) {
    quantity = 0;
  } else {
    quantity = cartItem.quantity - quantityDecrement;
  }

  const userId = Meteor.userId();
  const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
  const userIdForContext = anonymousUser ? null : userId;

  const context = Promise.await(getGraphQLContextInMeteorMethod(userIdForContext));
  const { cart: updatedCart } = Promise.await(updateCartItemsQuantity(context, {
    cartId: cart._id,
    token: cartToken,
    items: [
      { cartItemId, quantity }
    ]
  }));

  // Never send the hashed token to a client
  delete updatedCart.anonymousAccessToken;

  return { cart: updatedCart };
}
