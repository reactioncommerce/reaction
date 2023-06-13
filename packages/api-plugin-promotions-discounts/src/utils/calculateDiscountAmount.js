import formatMoney from "./formatMoney.js";

/**
 * @summary Calculate the discount amount
 * @param {Object} context - The application context
 * @param {Number} amount - The amount to calculate the discount for
 * @param {Object} parameters - The discount parameters
 * @returns {Number} - The discount amount
 */
export default function calculateDiscountAmount(context, amount, parameters) {
  const { discountCalculationType, discountValue } = parameters;
  const calculationMethod = context.discountCalculationMethods[discountCalculationType];

  const discountAmount = formatMoney(calculationMethod(discountValue, amount));
  return discountAmount;
}
