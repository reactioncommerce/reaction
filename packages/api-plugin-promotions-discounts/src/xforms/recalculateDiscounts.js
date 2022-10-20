import addDiscountToOrderItem from "../util/discountTypes/item/addDiscountToOrderItem.js";

/**
 * @summary Recalculates discounts on an order
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to recalculate discounts on
 * @returns {void} undefined
 */
export default function recalculateDiscounts(context, cart) {
  // recalculate item discounts
  for (const item of cart.items || []) {
    addDiscountToOrderItem(context, { item, cartItem: item });
  }

  // TODO: Recalculate shipping discounts
  // TODO: Recalculate order discounts
}
