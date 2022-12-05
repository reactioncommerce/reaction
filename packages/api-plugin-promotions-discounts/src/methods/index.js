/**
 * @summary Calculates the discount amount for the percentage discount type
 * @param {Number} discountValue - The discount value
 * @param {Number} price - The price to calculate the discount for
 * @returns {Number} The discount amount
 */
function percentage(discountValue, price) {
  return price * (1 - discountValue / 100);
}

/**
 * @summary Calculates the discount amount for the flat discount type
 * @param {Number} discountValue - The discount value
 * @returns {Number} The discount amount
 */
function flat(discountValue) {
  return discountValue;
}

/**
 * @summary Calculates the discount amount for the fixed discount type
 * @param {Number} discountValue - The discount value
 * @param {Number} price - The price to calculate the discount for
 * @returns {Number} The discount amount
 */
function fixed(discountValue, price) {
  if (discountValue > price) return 0;
  const amountToDiscount = Math.abs(discountValue - price);
  return amountToDiscount;
}

export default {
  percentage,
  flat,
  fixed
};
