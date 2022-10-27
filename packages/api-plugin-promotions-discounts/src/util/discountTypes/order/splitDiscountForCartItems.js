import accounting from "accounting-js";

/**
 * @summary Splits a discount across all cart items
 * @param {Number} totalDiscount - The total discount to split
 * @param {Array<Object>} cartItems - The cart items to split the discount across
 * @returns {void} undefined
 */
export default function splitDiscountForCartItems(totalDiscount, cartItems) {
  const totalItemPrice = cartItems.reduce((acc, item) => acc + item.subtotal.amount, 0);
  const discountForEachItem = {};
  cartItems.forEach((item) => {
    const discount = (item.subtotal.amount / totalItemPrice) * totalDiscount;
    discountForEachItem[item._id] = Number(accounting.toFixed(discount, 3));
  });
  return Object.keys(discountForEachItem).map((key) => ({ _id: key, amount: discountForEachItem[key] }));
}
