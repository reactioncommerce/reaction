import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import * as Collections from "/lib/collections";
import getCart from "/imports/plugins/core/cart/both/util/getCart";

/**
 * @method cart/removeFromCart
 * @memberof Cart/Methods
 * @summary Removes or adjust quantity of a variant from the cart
 * @param {String} itemId - cart item _id
 * @param {Number} [quantity] - if provided will adjust increment by quantity
 * @returns {Number} returns Mongo update result
 */
export default function removeFromCart(itemId, quantity) {
  check(itemId, String);
  check(quantity, Match.Optional(Number));

  const { cart } = getCart(null, { throwIfNotFound: true });

  let cartItem;

  if (Array.isArray(cart.items)) {
    cartItem = cart.items.find((item) => item._id === itemId);
  }

  // extra check of item exists
  if (!cartItem) {
    Logger.error(`Unable to find an item: ${itemId} within the cart: ${cart._id}`);
    throw new Meteor.Error("not-found", "Unable to find an item with such id in cart.");
  }

  if (!quantity || quantity >= cartItem.quantity) {
    let cartResult;
    try {
      cartResult = Collections.Cart.update({
        _id: cart._id
      }, {
        $pull: {
          items: {
            _id: itemId
          }
        }
      }, {
        getAutoValues: false // See https://github.com/aldeed/meteor-collection2/issues/245
      });
    } catch (error) {
      Logger.error("Error removing from cart.", error);
      Logger.error(
        "Error removing from cart. Invalid keys:",
        Collections.Cart.simpleSchema().namedContext().validationErrors()
      );
      throw error;
    }

    Logger.debug(`cart: deleted cart item variant id ${cartItem.variantId}`);

    Hooks.Events.run("afterCartUpdate", cart._id);
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

    return cartResult;
  }

  // if quantity lets convert to negative and increment
  const removeQuantity = Math.abs(quantity) * -1;

  let cartResult;
  try {
    cartResult = Collections.Cart.update({
      "_id": cart._id,
      "items._id": cartItem._id
    }, {
      $inc: {
        "items.$.quantity": removeQuantity
      }
    });
  } catch (error) {
    Logger.error("Error removing from cart.", error);
    Logger.error(
      "Error removing from cart. Invalid keys:",
      Collections.Cart.simpleSchema().namedContext().validationErrors()
    );
    throw error;
  }

  // Clear inventory status for multiple instances of this item
  // If quantity is provided, then set cartItem to it, so that quantity
  // provided will be cleared in the inventory.
  cartItem.quantity = quantity;

  Logger.debug(`cart: removed variant ${cartItem._id} quantity of ${quantity}`);

  Hooks.Events.run("afterCartUpdate", cart._id);
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  return cartResult;
}
