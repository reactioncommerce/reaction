import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import getCartDiscountTotal from "./getCartDiscountTotal.js";

const require = createRequire(import.meta.url);

const pkg = require("../../../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyOrderDiscountToCart.js"
};

/**
 * @summary Map discount record to cart discount
 * @param {Object} discount - Discount record
 * @returns {Object} Cart discount record
 */
function createDiscountRecord(discount) {
  const itemDiscount = {
    actionKey: discount.actionKey,
    promotionId: discount.promotionId,
    discountCalculationType: discount.discountCalculationType,
    discountValue: discount.discountValue,
    dateApplied: new Date()
  };
  return itemDiscount;
}

/**
 * @summary Apply the order discount to the cart
 * @param {Object} context - The application context
 * @param {Object} discount - The discount to apply
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<Object>} The updated cart
 */
export default async function applyOrderDiscountToCart(context, discount, cart) {
  cart.discounts = cart.discounts || [];
  const existingDiscount = cart.discounts
    .find((cartDiscount) => discount.actionKey === cartDiscount.actionKey && discount.promotionId === cartDiscount.promotionId);
  if (existingDiscount) {
    Logger.warn(logCtx, "Not adding discount because it already exists");
    return { cart };
  }
  cart.discounts.push(createDiscountRecord(discount));
  const discountTotal = getCartDiscountTotal(context, cart);
  cart.discount = discountTotal;
  return { cart };
}
