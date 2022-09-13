import getCartDiscountTotal from "./getCartDiscountTotal.js";

/**
 * @summary Map discount record to cart discount
 * @param {Object} discount - Discount record
 * @returns {Object} Cart discount record
 */
function createDiscountRecord(discount) {
  const itemDiscount = {
    _id: discount._id,
    discountLabel: discount.label,
    cartDescriptionByLanguage: [
      {
        language: "en",
        content: discount.label
      }
    ],
    discountCalculationType: discount.discountCalculationType,
    discountValue: discount.discountValue,
    dateApplied: new Date()
  };
  return itemDiscount;
}


export default async function applyOrderDiscountToCart(context, discount, cart) {
  cart.discounts = cart.discounts || [];
  cart.discounts.push(createDiscountRecord(discount));
  const discountTotal = getCartDiscountTotal(context, cart);
  cart.discount = discountTotal;
  return { cart };
}
