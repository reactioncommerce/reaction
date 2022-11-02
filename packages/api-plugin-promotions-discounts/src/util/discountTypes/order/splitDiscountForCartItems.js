import accounting from "accounting-js";

/**
 * @summary Splits a discount across all cart items
 * @param {Number} totalDiscount - The total discount to split
 * @param {Array<Object>} cartItems - The cart items to split the discount across
 * @returns {void} undefined
 */
export default function splitDiscountForCartItems(totalDiscount, cartItems) {
  const totalItemPrice = cartItems.reduce((acc, item) => acc + item.subtotal.amount, 0);
  const discountForEachItems = cartItems.map((item) => {
    const discount = (item.subtotal.amount / totalItemPrice) * totalDiscount;
    return { _id: item._id, amount: Number(accounting.toFixed(discount, 2)) };
  });
  return discountForEachItems;
}
