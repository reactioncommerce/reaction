import calculateDiscountedItemPrice from "./calculateDiscountedItemPrice.js";

/**
 * @summary recalculate item subtotal based on discounts
 * @param {Object} context - The application context
 * @param {Object} item - The item from the cart
 * @param {Object} cartItem - The cart item
 * @return {Object} - The mutated cart item
 */
export default function addDiscountToOrderItem(context, { item, cartItem }) {
  if (typeof item.subtotal === "object") {
    if (!item.subtotal.undiscountedAmount) {
      item.subtotal.undiscountedAmount = item.subtotal.amount;
      const itemTotal = calculateDiscountedItemPrice(context, { price: item.price.amount, quantity: item.quantity, discounts: cartItem ? cartItem.discounts : [] });
      item.subtotal.amount = itemTotal;
    }
  } else {
    item.undiscountedAmount = item.amount || 0;
    const itemTotal = calculateDiscountedItemPrice(context, { price: item.price.amount, quantity: item.quantity, discounts: cartItem ? cartItem.discounts : [] });
    item.subtotal = itemTotal;
    
  }
  item.discounts = cartItem ? cartItem.discounts : [];
  return item;
}
