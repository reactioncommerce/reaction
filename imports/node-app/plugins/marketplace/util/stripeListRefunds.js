import stripeNpm from "stripe";
import Logger from "@reactioncommerce/logger";
import getStripeApi from "./getStripeApi.js";

/**
 * @name stripeListRefunds
 * @method
 * @summary List refunds
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @returns {Object} list refunds result
 * @private
 */
export default async function stripeListRefunds(context, paymentMethod) {
  const stripeKey = await getStripeApi(context, paymentMethod.paymentPluginName, paymentMethod.shopId);
  const stripe = stripeNpm(stripeKey);
  let refundListResults;
  try {
    refundListResults = await stripe.refunds.list({ charge: paymentMethod.transactionId });
  } catch (error) {
    Logger.error("Encountered an error when trying to list refunds", error.message);
  }

  const result = [];
  if (refundListResults && refundListResults.data) {
    for (const refund of refundListResults.data) {
      result.push({
        _id: refund.id,
        amount: refund.amount / 100,
        created: refund.created * 1000,
        currency: refund.currency,
        reason: refund.reason,
        raw: refund,
        type: refund.object
      });
    }
  }
  return result;
}
