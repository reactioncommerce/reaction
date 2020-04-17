import accounting from "accounting-js";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Given an array of payment input and an order total,
 *   checks that the sum of all payment amounts matches the order total.
 *   Throws a ReactionError if not.
 * @param {Object[]} paymentsInput Array of PaymentInput objects, potentially empty
 * @param {Number} orderTotal The grand total of the order these payments are for.
 * @returns {undefined}
 */
export default function verifyPaymentsMatchOrderTotal(paymentsInput, orderTotal) {
  const paymentTotal = paymentsInput.reduce((sum, paymentInput) => sum + paymentInput.amount, 0);

  // In order to prevent mismatch due to rounding, we convert these to strings before comparing. What we really
  // care about is, do these match to the specificity that the shopper will see (i.e. to the scale of the currency)?
  // No currencies have greater than 3 decimal places, so we'll use 3.
  const paymentTotalString = accounting.toFixed(paymentTotal, 3);
  const orderTotalString = accounting.toFixed(orderTotal, 3);

  if (paymentTotalString !== orderTotalString) {
    Logger.debug("Error creating payments for a new order. " +
      `Order total (${orderTotalString}) does not match total of all payment amounts (${paymentTotalString}).`);
    throw new ReactionError("payment-failed", "Total of all payments must equal order total");
  }
}
