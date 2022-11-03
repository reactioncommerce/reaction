import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import getEligibleItems from "../../../utils/getEligibleItems.js";
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
 * @param {Object} params - The action parameters
 * @param {Array<Object>} discountedItems - The items that were discounted
 * @param {Number} discountedAmount - The total amount discounted
 * @returns {Object} Cart discount record
 */
export function createDiscountRecord(params, discountedItems, discountedAmount) {
  const { promotion: { _id }, actionParameters, actionKey } = params;
  const itemDiscount = {
    actionKey,
    promotionId: _id,
    discountType: actionParameters.discountType,
    discountCalculationType: actionParameters.discountCalculationType,
    discountValue: actionParameters.discountValue,
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
 * @param {Object} params - The action parameters
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<Object>} The updated cart
 */
export default async function applyOrderDiscountToCart(context, params, cart) {
  cart.discounts = cart.discounts || [];
  const { promotion: { _id: promotionId }, actionParameters, actionKey } = params;
  const existingDiscount = cart.discounts
    .find((cartDiscount) => actionKey === cartDiscount.actionKey && promotionId === cartDiscount.promotionId);
  if (existingDiscount) {
    Logger.warn(logCtx, "Not adding discount because it already exists");
    return { cart };
  }

  const discountAmount = getCartDiscountAmount(context, cart, actionParameters);
  const filteredItems = await getEligibleItems(context, cart.items, actionParameters);
  const discountedItems = splitDiscountForCartItems(discountAmount, filteredItems);

  cart.discounts.push(createDiscountRecord(params, discountedItems, discountAmount));

  for (const discountedItem of discountedItems) {
    const cartItem = cart.items.find((item) => item._id === discountedItem._id);
    if (cart.items.find((item) => item._id === discountedItem._id)) {
      cartItem.discounts.push(createDiscountRecord(params, undefined, discountedItem.amount));
    }
  }

  return { cart };
}
