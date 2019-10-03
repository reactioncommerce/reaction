import accounting from "accounting-js";

/**
 * @name Rate
 * @method
 * @memberof Core/GraphQL
 * @summary Converts a numeric rate to a Rate object
 * @param {Number} amount - The rate as a number
 * @returns {Object} The Rate object in GraphQL schema
 */
export default function getRateObjectForRate(amount) {
  if (!amount && amount !== 0) return null;

  const percent = amount * 100;
  return {
    amount,
    percent,
    displayPercent: `${accounting.toFixed(percent, 2)}%`
  };
}
