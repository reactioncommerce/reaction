import _ from "lodash";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import * as Collections from "/lib/collections";

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

  const userId = Meteor.userId();
  const cart = Collections.Cart.findOne({ userId });
  if (!cart) {
    Logger.error(`Cart not found for user: ${this.userId}`);
    throw new Meteor.Error("not-found", "Cart not found for user with such id");
  }

  let cartItem;

  if (cart.items) {
    cartItem = _.find(cart.items, (item) => item._id === itemId);
  }

  // extra check of item exists
  if (typeof cartItem !== "object") {
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

    Logger.debug(`cart: deleted cart item variant id ${cartItem.variants._id}`);

    // Clear inventory reservation
    Meteor.call("inventory/clearReserve", [cartItem]);
    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);
    // TODO: HACK: When calling update shipping the changes to the cart have not taken place yet
    // TODO: But calling this findOne seems to force this record to update. Extra weird since we aren't
    // TODO: passing the Cart but just the cartId and regrabbing it so you would think that would work but it does not
    Collections.Cart.findOne(cart._id);
    // refresh shipping quotes
    Meteor.call("shipping/updateShipmentQuotes", cart._id);
    // revert workflow
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
    // reset selected shipment method
    Meteor.call("cart/resetShipmentMethod", cart._id);
    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);
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
  Meteor.call("inventory/clearReserve", [cartItem]);
  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);
  Logger.debug(`cart: removed variant ${cartItem._id} quantity of ${quantity}`);
  // refresh shipping quotes
  Meteor.call("shipping/updateShipmentQuotes", cart._id);
  // revert workflow
  Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
  // reset selected shipment method
  Meteor.call("cart/resetShipmentMethod", cart._id);
  // Calculate taxes
  Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);

  return cartResult;
}
