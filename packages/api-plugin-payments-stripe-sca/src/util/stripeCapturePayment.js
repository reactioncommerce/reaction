import Logger from "@reactioncommerce/logger";
import getStripeInstance from "./getStripeInstance.js";

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
  const {
    amount,
    data: { stripePaymentIntentId }
  } = paymentMethod;

  const result = { saved: false };

  const stripe = await getStripeInstance(context);

  try {
    /* eslint-disable camelcase */
    const captureResult = await stripe.paymentIntents.capture(
      stripePaymentIntentId,
      {
        amount_to_capture: Math.round(amount * 100)
      }
    );

    result.response = captureResult;
    if (captureResult.status === "succeeded") {
      result.saved = true;
    }
  } catch (error) {
    Logger.debug(error);
    result.error = error;
    result.errorCode = error.code;
    result.errorMessage = error.message;

    if (error.code === "charge_already_captured") {
      result.isAlreadyCaptured = true;
    }
  }

  return result;
}
