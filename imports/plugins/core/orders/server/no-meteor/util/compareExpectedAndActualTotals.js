import accounting from "accounting-js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Compares expected total with actual total to make sure data is correct
 * @param {Number} actualTotal Actual total
 * @param {Number} expectedTotal Expected total
 * @returns {undefined}
 */
export default function compareExpectedAndActualTotals(actualTotal, expectedTotal) {
  // In order to prevent mismatch due to rounding, we convert these to strings before comparing. What we really
  // care about is, do these match to the specificity that the shopper will see (i.e. to the scale of the currency)?
  // No currencies have greater than 3 decimal places, so we'll use 3.
  const expectedTotalString = accounting.toFixed(expectedTotal, 3);
  const actualTotalString = accounting.toFixed(actualTotal, 3);

  if (expectedTotalString !== actualTotalString) {
    throw new ReactionError(
      "invalid",
      `Client provided total price ${expectedTotalString} for order group, but actual total price is ${actualTotalString}`
    );
  }
}
