import addToCart from "./addToCart";
import copyCartToOrder from "./copyCartToOrder";
import createCart from "./createCart";
import mergeCart from "./mergeCart";
import removeFromCart from "./removeFromCart";
import resetShipmentMethod from "./resetShipmentMethod";
import setAnonymousUserEmail from "./setAnonymousUserEmail";
import setPaymentAddress from "./setPaymentAddress";
import setShipmentAddress from "./setShipmentAddress";
import setShipmentMethod from "./setShipmentMethod";
import setUserCurrency from "./setUserCurrency";
import submitPayment from "./submitPayment";
import unsetAddresses from "./unsetAddresses";

/**
 * @file Methods for Cart - Use these methods by running `Meteor.call()`
 * @example Meteor.call("cart/createCart")
 * @namespace Cart/Methods
 */

export default {
  "cart/addToCart": addToCart,
  "cart/copyCartToOrder": copyCartToOrder,
  "cart/createCart": createCart,
  "cart/mergeCart": mergeCart,
  "cart/removeFromCart": removeFromCart,
  "cart/resetShipmentMethod": resetShipmentMethod,
  "cart/setAnonymousUserEmail": setAnonymousUserEmail,
  "cart/setPaymentAddress": setPaymentAddress,
  "cart/setShipmentAddress": setShipmentAddress,
  "cart/setShipmentMethod": setShipmentMethod,
  "cart/setUserCurrency": setUserCurrency,
  "cart/submitPayment": submitPayment,
  "cart/unsetAddresses": unsetAddresses
};
