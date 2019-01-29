import stripeNpm from "stripe";
import packageJson from "/package.json";
import Logger from "@reactioncommerce/logger";
import formatForStripe from "./formatForStripe";
import getStripeApiKey from "./getStripeApiKey";

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


  const stripeKey = await getStripeApiKey(context, payment.paymentPluginName, payment.shopId);
  const stripe = stripeNpm(stripeKey);
  stripe.setAppInfo({
    name: "ReactionCommerce",
    version: packageJson.version,
    url: packageJson.url
  });

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
