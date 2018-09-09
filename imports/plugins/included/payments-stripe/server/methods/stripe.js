import Logger from "@reactioncommerce/logger";
import accounting from "accounting-js";
import stripeNpm from "stripe";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";

/**
 * @summary Stripe uses a "Decimal-less" format so 10.00 becomes 1000
 * @param {Number} amount Non-Stripe amount
 * @returns {Number} Stripe amount
 */
function formatForStripe(amount) {
  return Math.round(amount * 100);
}

/**
 * @summary Stripe uses a "Decimal-less" format so 10.00 becomes 1000
 * @param {Number} amount Stripe amount
 * @returns {Number} Non-Stripe amount
 */
function unformatFromStripe(amount) {
  return (amount / 100);
}

export const utils = {};

utils.getStripeApi = function (paymentPluginName, shopId) {
  const stripePackage = Packages.findOne({ name: paymentPluginName, shopId });
  if (!stripePackage) throw new Error(`No package found with name ${paymentPluginName}`);
  const stripeKey = stripePackage.settings.api_key || stripePackage.settings.connectAuth.access_token;
  return stripeKey;
};

/**
 * @summary Capture the results of a previous charge
 * @param {object} payment - Object containing info about the previous transaction
 * @returns {object} Object indicating the result, saved = true means success
 * @private
 */
function stripeCaptureCharge(payment) {
  let result;
  const captureDetails = {
    amount: formatForStripe(payment.amount)
  };


  const stripeKey = utils.getStripeApi(payment.paymentPluginName, payment.shopId);
  const stripe = stripeNpm(stripeKey);

  try {
    const capturePromise = stripe.charges.capture(payment.transactionId, captureDetails);
    const captureResult = Promise.await(capturePromise);

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

export const methods = {
  /**
   * Capture a Stripe charge
   * @see https://stripe.com/docs/api#capture_charge
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {Object} results from Stripe normalized
   */
  "stripe/payment/capture"(paymentMethod) {
    check(paymentMethod, Object);

    const captureDetails = {
      amount: formatForStripe(paymentMethod.amount)
    };

    // 100% discounts are not valid when using Stripe
    // If discount is 100%, capture 100% and then refund 100% of transaction
    if (captureDetails.amount === accounting.unformat(0)) {
      const voidedAmount = unformatFromStripe(paymentMethod.transactions[0].amount);
      stripeCaptureCharge(paymentMethod);

      return Meteor.call("stripe/refund/create", paymentMethod, voidedAmount);
    }
    return stripeCaptureCharge(paymentMethod);
  },

  /**
   * Issue a refund against a previously captured transaction
   * @see https://stripe.com/docs/api#refunds
   * @param  {Object} paymentMethod object
   * @param  {Number} amount to be refunded
   * @param  {String} reason refund was issued (currently unused by client)
   * @return {Object} result
   */
  "stripe/refund/create"(paymentMethod, amount, reason = "requested_by_customer") {
    check(paymentMethod, Object);
    check(amount, Number);
    check(reason, String);

    let result;
    try {
      const stripeKey = utils.getStripeApi(paymentMethod.paymentPluginName, paymentMethod.shopId);
      const stripe = stripeNpm(stripeKey);
      const refundPromise = stripe.refunds.create({ charge: paymentMethod.transactionId, amount: formatForStripe(amount) });
      const refundResult = Promise.await(refundPromise);
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
  },

  /**
   * List refunds
   * @param  {Object} paymentMethod object
   * @return {Object} result
   */
  "stripe/refund/list"(paymentMethod) {
    check(paymentMethod, Object);

    const stripeKey = utils.getStripeApi(paymentMethod.paymentPluginName, paymentMethod.shopId);
    const stripe = stripeNpm(stripeKey);
    let refundListResults;
    try {
      const refundListPromise = stripe.refunds.list({ charge: paymentMethod.transactionId });
      refundListResults = Promise.await(refundListPromise);
    } catch (error) {
      Logger.error("Encountered an error when trying to list refunds", error.message);
    }

    const result = [];
    if (refundListResults && refundListResults.data) {
      for (const refund of refundListResults.data) {
        result.push({
          type: refund.object,
          amount: refund.amount / 100,
          created: refund.created * 1000,
          currency: refund.currency,
          raw: refund
        });
      }
    }
    return result;
  }
};

Meteor.methods(methods);
