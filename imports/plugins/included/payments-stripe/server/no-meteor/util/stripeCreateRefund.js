import Logger from "@reactioncommerce/logger";
import getStripeApiKey from "./getStripeApiKey";
import getStripeInstance from "./getStripeInstance";
import formatForStripe from "./formatForStripe";

/**
 * @name stripeCreateRefund
 * @method
 * @summary Create a Stripe refund for an order
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @param {Number} amount the amount to be refunded
 * @return {Object} refund result
 * @private
 */
export default async function stripeCreateRefund(context, paymentMethod, amount) {
  let result;
  try {
    const stripeKey = await getStripeApiKey(context, paymentMethod.paymentPluginName, paymentMethod.shopId);
    const stripe = getStripeInstance(stripeKey);

    const refundResult = await stripe.refunds.create({ charge: paymentMethod.transactionId, amount: formatForStripe(amount) });
    Logger.debug(refundResult);
    if (refundResult && refundResult.object === "refund") {
      result = {
        saved: true,
        response: refundResult
      };
    } else {
      result = {
        saved: false,
        response: refundResult
      };
      Logger.warn("Stripe call succeeded but refund not issued");
    }
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: `Cannot issue refund: ${error.message}`
    };
    Logger.fatal("Stripe call failed, refund was not issued", error.message);
  }
  return result;
}
