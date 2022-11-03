import { createRequire } from "module";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import applyItemDiscountToCart from "../utils/discountTypes/item/applyItemDiscountToCart.js";
import applyShippingDiscountToCart from "../utils/discountTypes/shipping/applyShippingDiscountToCart.js";
import applyOrderDiscountToCart from "../utils/discountTypes/order/applyOrderDiscountToCart.js";

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
  paramSchema: discountActionParameters
};
