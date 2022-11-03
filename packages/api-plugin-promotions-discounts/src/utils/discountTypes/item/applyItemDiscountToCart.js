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
 * @param {Object} params - The action parameters
 * @param {Number} discountedAmount - The amount discounted
 * @returns {Object} - The cart item discount object
 */
export function createItemDiscount(item, params) {
  const { promotion: { _id }, actionParameters, actionKey } = params;
  const itemDiscount = {
    actionKey,
    promotionId: _id,
    discountType: actionParameters.discountType,
    discountCalculationType: actionParameters.discountCalculationType,
    discountValue: actionParameters.discountValue,
    dateApplied: new Date()
  };
  return itemDiscount;
}

/**
 * @summary Add the discount to the cart item
 * @param {Object} context - The application context
 * @param {Object} params - The params to apply
 * @param {Object} params.item - The cart item to apply the discount to
 * @returns {Promise<void>} undefined
 */
export async function addDiscountToItem(context, params, { item }) {
  const { promotion: { _id }, actionKey } = params;
  const existingDiscount = item.discounts
    .find((itemDiscount) => actionKey === itemDiscount.actionKey && _id === itemDiscount.promotionId);
  if (existingDiscount) {
    Logger.warn(logCtx, "Not adding discount because it already exists");
    return;
  }
  const cartDiscount = createItemDiscount(item, params);
  item.discounts.push(cartDiscount);
}

/**
 * @summary Apply the discount to the cart
 * @param {Object} context - The application context
 * @param {Object} params - The discount parameters
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<Object>} - The updated cart with results
 */
export default async function applyItemDiscountToCart(context, params, cart) {
  const discountedItems = [];

  const filteredItems = await getEligibleItems(context, cart.items, params.actionParameters);

  for (const item of filteredItems) {
    addDiscountToItem(context, params, { item });
    discountedItems.push(item);
  }

  if (discountedItems.length) {
    Logger.info(logCtx, "Saved Discount to cart");
  }

  return { cart, discountedItems };
}
