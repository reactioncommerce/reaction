import { createRequire } from "module";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import applyItemDiscountToCart from "../discountTypes/item/applyItemDiscountToCart.js";
import applyShippingDiscountToCart from "../discountTypes/shipping/applyShippingDiscountToCart.js";
import applyOrderDiscountToCart from "../discountTypes/order/applyOrderDiscountToCart.js";

const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "actions/discountAction.js"
};

const functionMap = {
  item: applyItemDiscountToCart,
  shipping: applyShippingDiscountToCart,
  order: applyOrderDiscountToCart
};

export const Rules = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true
  }
});

export const discountActionParameters = new SimpleSchema({
  discountType: {
    type: String,
    allowedValues: ["item", "order", "shipping"]
  },
  discountCalculationType: {
    type: String,
    allowedValues: ["flat", "fixed", "percentage"]
  },
  discountValue: {
    type: Number
  },
  inclusionRules: {
    type: Rules
  },
  exclusionRules: {
    type: Rules,
    optional: true
  }
});

/**
 * @summary Clean up the discount on the cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to clean up the discount on
 * @return {void} undefined
 */
export async function discountActionCleanup(context, cart) {
  cart.discounts = [];
  cart.discount = 0;
  cart.items = cart.items.map((item) => {
    item.discounts = [];
    item.subtotal = {
      amount: item.price.amount * item.quantity,
      currencyCode: item.subtotal.currencyCode
    };
    return item;
  });

  // todo: add reset logic for the shipping
  // cart.shipping = cart.shipping.map((shipping) => ({ ...shipping, discounts: [] }));

  return cart;
}

/**
 * @summary Apply a percentage promotion to the cart
 * @param {Object} context - The application context
 * @param {Object} cart - The enhanced cart to apply promotions to
 * @param {Object} params - The action parameters
 * @returns {Promise<void>} undefined
 */
export async function discountActionHandler(context, cart, params) {
  const { discountType } = params.actionParameters;

  Logger.info({ params, cartId: cart._id, ...logCtx }, "applying discount to cart");

  const { cart: updatedCart } = await functionMap[discountType](context, params, cart);

  Logger.info(logCtx, "Completed applying Discount to Cart");
  return { updatedCart };
}

export default {
  key: "discounts",
  handler: discountActionHandler,
  paramSchema: discountActionParameters,
  cleanup: discountActionCleanup
};
