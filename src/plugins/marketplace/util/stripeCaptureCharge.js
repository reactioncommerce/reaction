import stripeNpm from "stripe";
import Logger from "@reactioncommerce/logger";
import formatForStripe from "./formatForStripe.js";
import getStripeApi from "./getStripeApi.js";

/**
 * @summary Capture the results of a previous charge
 * @param {Object} context - an object containing the per-request state
 * @param {Object} payment - object containing info about the previous transaction
 * @returns {Object} Object indicating the result, saved = true means success
 * @private
 */
export default async function stripeCaptureCharge(context, payment) {
  const result = { saved: false };
  const captureDetails = {
    amount: formatForStripe(payment.amount)
  };

  const stripeKey = await getStripeApi(context, payment.paymentPluginName, payment.shopId);
  const stripe = stripeNpm(stripeKey);

  try {
    const captureResult = await stripe.charges.capture(payment.transactionId, captureDetails);
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
