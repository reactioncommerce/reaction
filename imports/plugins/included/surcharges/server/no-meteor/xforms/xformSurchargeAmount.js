/**
 * @name xformSurchargeAmount
 * @summary Transforms amount from Float to Money type
 * @param {String} importedAmount amount to convert to Money type
 * @return {Object} Transformed amount
 */
export default async function xformSurchargeAmount(importedAmount) {
  return {
    amount: importedAmount
  };
}
