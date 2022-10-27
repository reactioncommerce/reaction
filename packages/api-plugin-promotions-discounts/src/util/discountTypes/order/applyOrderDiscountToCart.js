import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import getCartDiscountAmount from "./getCartDiscountAmount.js";
import splitDiscountForCartItems from "./splitDiscountForCartItems.js";

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
 * @param {Array<Object>} discountedItems - The items that were discounted
 * @param {Number} discountedAmount - The total amount discounted
 * @returns {Object} Cart discount record
 */
function createDiscountRecord(discount, discountedItems, discountedAmount) {
  const itemDiscount = {
    actionKey: discount.actionKey,
    promotionId: discount.promotionId,
    discountType: discount.discountType,
    discountCalculationType: discount.discountCalculationType,
    discountValue: discount.discountValue,
    dateApplied: new Date(),
    discountedItemType: "item",
    discountedAmount,
    discountedItems
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

  const discountAmount = getCartDiscountAmount(context, cart, discount);
  const discountedItems = splitDiscountForCartItems(discountAmount, cart.items);

  cart.discounts.push(createDiscountRecord(discount, discountedItems, discountAmount));

  for (const cartItem of cart.items) {
    const itemDiscount = discountedItems.find((item) => item._id === cartItem._id);
    cartItem.discounts.push(createDiscountRecord(discount, undefined, itemDiscount.amount));
  }

  return { cart };
}
