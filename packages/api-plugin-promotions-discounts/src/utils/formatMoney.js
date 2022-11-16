import accounting from "accounting-js";

/**
 * @summary Formats a number as money with 2 decimal places
 * @param {Number} amount - The amount to format
 * @returns {String} The formatted amount
 */
export default function formatMoney(amount) {
  return Number(accounting.toFixed(amount, 2));
}
