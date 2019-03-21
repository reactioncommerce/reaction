import addToCart from "./addToCart";
import createCart from "./createCart";
import mergeCart from "./mergeCart";
import removeFromCart from "./removeFromCart";
import setShipmentMethod from "./setShipmentMethod";
import setUserCurrency from "./setUserCurrency";

/**
 * @file Methods for Cart - Use these methods by running `Meteor.call()`
 * @example Meteor.call("cart/createCart")
 * @namespace Cart/Methods
 */

export default {
  "cart/addToCart": addToCart,
  "cart/createCart": createCart,
  "cart/mergeCart": mergeCart,
  "cart/removeFromCart": removeFromCart,
  "cart/setShipmentMethod": setShipmentMethod,
  "cart/setUserCurrency": setUserCurrency
};
