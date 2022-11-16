/**
 * @summary recalculate item subtotal based on discounts
 * @param {Object} context - The application context
 * @param {Object} item - The item from the cart
 * @param {Object} cartItem - The cart item
 * @return {Object} - The mutated cart item
 */
export default function addDiscountToOrderItem(context, { item, cartItem }) {
  if (!cartItem) return item;

  if (typeof item.subtotal === "object") {
    item.subtotal = cartItem.subtotal;
  } else {
    item.undiscountedAmount = cartItem.subtotal.undiscountedAmount;
    item.discount = cartItem.subtotal.discount;
    item.subtotal = cartItem.subtotal.amount;
  }
  item.discounts = cartItem.discounts;
  return item;
}
