import Logger from "@reactioncommerce/logger";
import _ from "lodash";
import pkg from "../../../package.json" assert { type: "json" };

import getEligibleItems from "../../utils/getEligibleItems.js";
import recalculateCartItemSubtotal from "../../utils/recalculateCartItemSubtotal.js";
import getTotalDiscountOnCart from "../../utils/getTotalDiscountOnCart.js";


const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyItemDiscountToCart.js"
};

/**
 * @summary Create a discount object for a cart item
 * @param {Object} params - The action parameters
 * @param {Number} discountedAmount - The amount discounted
 * @returns {Object} - The cart item discount object
 */
export function createItemDiscount(params) {
  const { promotion, actionParameters } = params;
  const itemDiscount = {
    promotionId: promotion._id,
    discountType: actionParameters.discountType,
    discountCalculationType: actionParameters.discountCalculationType,
    discountValue: actionParameters.discountValue,
    discountMaxValue: actionParameters.discountMaxValue,
    discountMaxUnits: actionParameters.discountMaxUnits,
    dateApplied: new Date(),
    stackability: promotion.stackability,
    neverStackWithOtherItemLevelDiscounts: actionParameters.neverStackWithOtherItemLevelDiscounts
  };
  return itemDiscount;
}

/**
 * @summary Check if the item is eligible for the discount
 * @param {Object} item - The cart item
 * @param {Object} discount - The discount object
 * @returns {Boolean} - Whether the item is eligible for the discount
 */
export function canBeApplyDiscountToItem(item, discount) {
  const itemDiscounts = _.filter(item.discounts || [], ({ discountType }) => discountType === "item");
  if (itemDiscounts.length === 0) return true;

  const containsItemsNeverStackWithOrderItem = _.some(itemDiscounts, "neverStackWithOtherItemLevelDiscounts");
  if (containsItemsNeverStackWithOrderItem) return false;

  if (discount.neverStackWithOtherItemLevelDiscounts) return false;
  return true;
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
    const cartDiscount = createItemDiscount(params);
    const shouldAppliedDiscount = canBeApplyDiscountToItem(item, cartDiscount);
    if (shouldAppliedDiscount) {
      item.discounts.push(cartDiscount);
      discountedItems.push(item);
      recalculateCartItemSubtotal(context, item);
    }
  }

  cart.discount = getTotalDiscountOnCart(cart);

  if (discountedItems.length) {
    Logger.info(logCtx, "Saved Discount to cart");
  }

  const affected = discountedItems.length > 0;
  const reason = !affected ? "No items were discounted" : undefined;

  return { cart, affected, reason };
}
