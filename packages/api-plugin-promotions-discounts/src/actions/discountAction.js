import { createRequire } from "module";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import applyItemDiscountToCart from "../util/discountTypes/item/applyItemDiscountToCart.js";
import applyShippingDiscountToCart from "../util/discountTypes/shipping/applyShippingDiscountToCart.js";
import applyOrderDiscountToCart from "../util/discountTypes/order/applyOrderDiscountToCart.js";

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

const Conditions = new SimpleSchema({
  maxUses: {
    // total number of uses
    type: Number,
    defaultValue: 1
  },
  maxUsesPerAccount: {
    // Max uses per account
    type: SimpleSchema.Integer,
    defaultValue: 1,
    optional: true
  },
  maxUsersPerOrder: {
    // Max uses per order
    type: Number,
    defaultValue: 1
  }
});

export const Rules = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true
  }
});

const discountActionParameters = new SimpleSchema({
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
  condition: {
    type: Conditions
  },
  rules: {
    type: Rules,
    optional: true
  }
});
/**
 * @summary Apply a percentage promotion to the cart
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The enhanced cart to apply promotions to
 * @param {Object} params.promotion - The promotion to apply
 * @param {Object} params.actionParameters - The parameters to pass to the action
 * @returns {Promise<void>} undefined
 */
async function discountAction(context, enhancedCart, { promotion, actionParameters }) {
  const { collections: { Cart } } = context;
  const { discountType } = actionParameters;

  actionParameters.promotionId = promotion._id;
  actionParameters.actionKey = "discounts";

  const cart = await Cart.findOne({ _id: enhancedCart._id });

  Logger.info({ actionParameters, cartId: cart._id, ...logCtx }, "applying discount to cart");

  const { cart: modifiedCart } = await functionMap[discountType](context, actionParameters, cart);

  await context.mutations.saveCart(context, modifiedCart, "promotions");
  Logger.info(logCtx, "Completed applying Discount to Cart");
}

export default {
  key: "discounts",
  handler: discountAction,
  paramSchema: discountActionParameters
};
