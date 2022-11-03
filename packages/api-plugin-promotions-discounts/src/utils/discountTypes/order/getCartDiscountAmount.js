import accounting from "accounting-js";
import { calculateMerchandiseTotal } from "../../calculateMerchandiseTotal.js";

/**
 * @summary Get the discount amount for a discount item
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to calculate the discount for
 * @param {Object} discount - The discount to calculate the discount amount for
 * @returns {Number} - The discount amount
 */
export default function getCartDiscountAmount(context, cart, discount) {
  const merchandiseTotal = cart.merchandiseTotal || calculateMerchandiseTotal(cart);
  const { discountCalculationType, discountValue } = discount;
  const appliedDiscount = context.discountCalculationMethods[discountCalculationType](discountValue, merchandiseTotal);
  return Number(accounting.toFixed(appliedDiscount, 2));
}
