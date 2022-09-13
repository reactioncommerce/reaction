import addDiscountToOrderItem from "../util/discountTypes/item/addDiscountToOrderItem.js";

export default function recalculateDiscounts(context, cart) {
  // recalculate item discounts
  for (const item of cart.items) {
    addDiscountToOrderItem(context, { item, cartItem: item });
  }

  // TODO: Recalculate shipping discounts
  // TODO: Recalculate order discounts
}
