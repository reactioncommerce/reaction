import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import getEligibleItems from "../../../utils/getEligibleItems.js";

const require = createRequire(import.meta.url);

const pkg = require("../../../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyItemDiscountToCart.js"
};

/**
 * @summary Create a discount object for a cart item
 * @param {Object} item - The cart item
 * @param {Object} discount - The discount to create
 * @param {Number} discountedAmount - The amount discounted
 * @returns {Object} - The cart item discount object
 */
export function createItemDiscount(item, discount, discountedAmount) {
  const itemDiscount = {
    actionKey: discount.actionKey,
    promotionId: discount.promotionId,
    discountType: discount.discountType,
    discountCalculationType: discount.discountCalculationType,
    discountValue: discount.discountValue,
    dateApplied: new Date(),
    discountedAmount
  };
  return itemDiscount;
}

/**
 * @summary Add the discount to the cart item
 * @param {Object} context - The application context
 * @param {Object} discount - The discount to apply
 * @param {Object} params.item - The cart item to apply the discount to
 * @returns {Promise<void>} undefined
 */
export async function addDiscountToItem(context, discount, { item }) {
  const existingDiscount = item.discounts
    .find((itemDiscount) => discount.actionKey === itemDiscount.actionKey && discount.promotionId === itemDiscount.promotionId);
  if (existingDiscount) {
    Logger.warn(logCtx, "Not adding discount because it already exists");
    return;
  }
  const cartDiscount = createItemDiscount(item, discount);
  item.discounts.push(cartDiscount);
}

/**
 * @summary Apply the discount to the cart
 * @param {Object} context - The application context
 * @param {Object} discountParameters - The discount parameters
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<Object>} - The updated cart with results
 */
export default async function applyItemDiscountToCart(context, discountParameters, cart) {
  const allResults = [];
  const discountedItems = [];

  const filteredItems = await getEligibleItems(context, cart.items, discountParameters);

  for (const item of filteredItems) {
    addDiscountToItem(context, discountParameters, { item });
    discountedItems.push(item);
  }

  if (discountedItems.length) {
    Logger.info(logCtx, "Saved Discount to cart");
  }

  return { cart, allResults, discountedItems };
}
