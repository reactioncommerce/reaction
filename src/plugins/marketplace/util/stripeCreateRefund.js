import stripeNpm from "stripe";
import Logger from "@reactioncommerce/logger";
import getStripeApi from "./getStripeApi.js";
import formatForStripe from "./formatForStripe.js";

/**
 * @name stripeCreateRefund
 * @method
 * @summary Create a Stripe refund for an order
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @param {Number} amount the amount to be refunded
 * @param {String} [reason] the reason for the refund - allowed values are `duplicate`, `fraudulent`, and `requested_by_customer` (https://stripe.com/docs/api/refunds/object#refund_object-reason)
 * @returns {Object} refund result
 * @private
 */
export default async function stripeCreateRefund(context, paymentMethod, amount, reason) {
  let result;
  try {
    const stripeKey = await getStripeApi(context, paymentMethod.paymentPluginName, paymentMethod.shopId);
    const stripe = stripeNpm(stripeKey);
    const refundResult = await stripe.refunds.create({ charge: paymentMethod.transactionId, amount: formatForStripe(amount), reason });
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
