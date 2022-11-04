import accounting from "accounting-js";

/**
 * @summary Get the total amount of all items in the cart
 * @param {Object} cart - The cart to get the total amount of
 * @returns {Number} The total amount of all items in the cart
 */
export default function getTotalDiscountOnCart(cart) {
  let totalDiscount = 0;

  for (const item of cart.items) {
    totalDiscount += item.subtotal.discount || 0;
  }

  // TODO: Add the logic to calculate the total discount on shipping

  return Number(accounting.toFixed(totalDiscount, 2));
}
