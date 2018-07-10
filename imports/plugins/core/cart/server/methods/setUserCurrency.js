import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Collections from "/lib/collections";
import getCart from "/imports/plugins/core/cart/both/util/getCart";

/**
 * @method cart/setUserCurrency
 * @memberof Cart/Methods
 * @summary Saves user currency in cart, to be paired with order/setCurrencyExhange
 * @param {String} cartId - cartId to apply setUserCurrency
 * @param {String} userCurrency - userCurrency to set to cart
 * @return {Number} update result
 */
export default function setUserCurrency(cartId, userCurrency) {
  check(cartId, String);
  check(userCurrency, String);

  const { cart } = getCart(cartId);
  if (!cart) {
    Logger.error(`Cart not found for user: ${this.userId}`);
    throw new Meteor.Error("not-found", "Cart not found for user with such id");
  }

  const userCurrencyString = {
    userCurrency
  };

  let selector;
  let update;

  if (cart.billing) {
    selector = {
      "_id": cartId,
      "billing._id": cart.billing[0]._id
    };
    update = {
      $set: {
        "billing.$.currency": userCurrencyString
      }
    };
  } else {
    selector = {
      _id: cartId
    };
    update = {
      $addToSet: {
        billing: {
          currency: userCurrencyString
        }
      }
    };
  }

  // add / or set the shipping address
  try {
    Collections.Cart.update(selector, update);
  } catch (error) {
    Logger.error(error);
    throw new Meteor.Error("server-error", "An error occurred adding the currency");
  }

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  return true;
}
