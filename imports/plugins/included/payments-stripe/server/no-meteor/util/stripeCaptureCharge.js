import stripeNpm from "stripe";
import Logger from "@reactioncommerce/logger";
import formatForStripe from "./formatForStripe";
import getStripeApi from "./getStripeApi";

/**
 * @summary Capture the results of a previous charge
 * @param {object} context - an object containing the per-request state
 * @param {object} payment - object containing info about the previous transaction
 * @returns {object} Object indicating the result, saved = true means success
 * @private
 */
export default async function stripeCaptureCharge(context, payment) {
  let result;
  const captureDetails = {
    amount: formatForStripe(payment.amount)
  };


  const stripeKey = await getStripeApi(context, payment.paymentPluginName, payment.shopId);
  const stripe = stripeNpm(stripeKey);

  try {
    const captureResult = await stripe.charges.capture(payment.transactionId, captureDetails);
    if (captureResult.status === "succeeded") {
      result = {
        saved: true,
        response: captureResult
      };
    } else {
      result = {
        saved: false,
        response: captureResult
      };
    }
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error
    };
    return { error, result };
  }
  return result;
}
