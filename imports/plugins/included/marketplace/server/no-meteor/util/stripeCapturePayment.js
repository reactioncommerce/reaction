import accounting from "accounting-js";
import stripeCaptureCharge from "./stripeCaptureCharge";
import stripeCreateRefund from "./stripeCreateRefund";
import formatForStripe from "./formatForStripe";
import unformatFromStripe from "./unformatFromStripe";

/**
 * @name stripeCapturePayment
 * @method
 * @summary Capture payment for Stripe payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @return {Promise} capturing a payment in Stripe
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
    stripeCaptureCharge(paymentMethod);

    return stripeCreateRefund(context, paymentMethod, voidedAmount);
  }

  return stripeCaptureCharge(context, paymentMethod);
}
