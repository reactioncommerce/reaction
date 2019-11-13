import accounting from "accounting-js";
import stripeCaptureCharge from "./stripeCaptureCharge.js";
import stripeCreateRefund from "./stripeCreateRefund.js";
import formatForStripe from "./formatForStripe.js";
import unformatFromStripe from "./unformatFromStripe.js";

/**
 * @name stripeCapturePayment
 * @method
 * @summary Capture payment for Stripe payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @returns {Promise} capturing a payment in Stripe
 * @private
 */
export default async function stripeCapturePayment(context, paymentMethod) {
  const captureDetails = {
    amount: formatForStripe(paymentMethod.amount)
  };

  // 100% discounts are not valid when using Stripe
  // If discount is 100%, capture 100% and then refund 100% of transaction
  if (captureDetails.amount === accounting.unformat(0)) {
    const voidedAmount = unformatFromStripe(paymentMethod.transactions[0].amount);
    await stripeCaptureCharge(context, paymentMethod);

    return stripeCreateRefund(context, paymentMethod, voidedAmount);
  }
  return stripeCaptureCharge(context, paymentMethod);
}
