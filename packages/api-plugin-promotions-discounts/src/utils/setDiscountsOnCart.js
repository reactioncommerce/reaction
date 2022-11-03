import recalculateCartItemSubtotal from "./discountTypes/item/recalculateCartItemSubtotal.js";
import getCartDiscountTotal from "./discountTypes/order/getCartDiscountTotal.js";

/**
 * @summary Cart transformation function that sets `discount` on cart
 * @param {Object} context Startup context
 * @param {Object} cart The cart, which can be mutated.
 * @returns {undefined}
 */
export default async function setDiscountsOnCart(context, cart) {
  if (!cart.discounts) {
    cart.discounts = [];
  }
  cart.items.forEach((item) => {
    if (!item.discounts) {
      item.discounts = [];
    }
  });
  const discountTotal = getCartDiscountTotal(context, cart);
  cart.discount = discountTotal;

  for (const item of cart.items) {
    recalculateCartItemSubtotal(context, item);
  }
}
