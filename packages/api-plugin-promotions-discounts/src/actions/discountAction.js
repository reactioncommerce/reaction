import Logger from "@reactioncommerce/logger";
import SimpleSchema from "simpl-schema";
import pkg from "../../package.json" assert { type: "json" };
import applyItemDiscountToCart from "../discountTypes/item/applyItemDiscountToCart.js";
import applyShippingDiscountToCart from "../discountTypes/shipping/applyShippingDiscountToCart.js";
import applyOrderDiscountToCart from "../discountTypes/order/applyOrderDiscountToCart.js";
import { DiscountActionCondition } from "../simpleSchemas.js";


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
  discountMaxValue: {
    type: Number,
    optional: true
  },
  discountMaxUnits: {
    type: Number,
    optional: true
  },
  inclusionRules: {
    type: DiscountActionCondition,
    optional: true
  },
  exclusionRules: {
    type: DiscountActionCondition,
    optional: true
  },
  neverStackWithOtherItemLevelDiscounts: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  neverStackWithOtherShippingDiscounts: {
    type: Boolean,
    optional: true,
    defaultValue: false
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

  // eslint-disable-next-line require-jsdoc
  function resetMethod(method) {
    method.rate = method.undiscountedRate || method.rate;
    method.discount = 0;
    method.shippingPrice = method.rate + (method.handlingPrice || method.handling);
    method.undiscountedRate = 0;
  }

  for (const shipping of cart.shipping) {
    shipping.discounts = [];

    if (!shipping.shipmentQuotes) shipping.shipmentQuotes = [];
    shipping.shipmentQuotes.forEach((quote) => {
      resetMethod(quote.method);
      resetMethod(quote);
      quote.discounts = [];
    });

    if (shipping.shipmentMethod) {
      resetMethod(shipping.shipmentMethod);
    }
  }

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

  const { cart: updatedCart, affected, reason, temporaryAffected } = await functionMap[discountType](context, params, cart);

  Logger.info({ ...logCtx, ...params.actionParameters, cartId: cart._id, cartDiscount: cart.discount }, "Completed applying Discount to Cart");
  return { updatedCart, affected, reason, temporaryAffected };
}

export default {
  key: "discounts",
  handler: discountActionHandler,
  paramSchema: discountActionParameters,
  cleanup: discountActionCleanup
};
