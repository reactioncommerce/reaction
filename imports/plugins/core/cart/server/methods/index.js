import addToCart from "./addToCart";
import createCart from "./createCart";
import mergeCart from "./mergeCart";
import removeFromCart from "./removeFromCart";
import setPaymentAddress from "./setPaymentAddress";
import setShipmentAddress from "./setShipmentAddress";
import setShipmentMethod from "./setShipmentMethod";
import setUserCurrency from "./setUserCurrency";
import unsetAddresses from "./unsetAddresses";

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
  "cart/setPaymentAddress": setPaymentAddress,
  "cart/setShipmentAddress": setShipmentAddress,
  "cart/setShipmentMethod": setShipmentMethod,
  "cart/setUserCurrency": setUserCurrency,
  "cart/unsetAddresses": unsetAddresses
};
