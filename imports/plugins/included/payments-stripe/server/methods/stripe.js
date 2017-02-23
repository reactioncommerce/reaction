import accounting from "accounting-js";
/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
// reaction modules
import { Reaction, Logger } from "/server/api";
import { StripeApi } from "./stripeapi";

function luhnValid(x) {
  return [...x].reverse().reduce((sum, c, i) => {
    let d = parseInt(c, 10);
    if (i % 2 !== 0) { d *= 2; }
    if (d > 9) { d -= 9; }
    return sum + d;
  }, 0) % 10 === 0;
}

const ValidCardNumber = Match.Where(function (x) {
  return /^[0-9]{13,16}$/.test(x) && luhnValid(x);
});

const ValidExpireMonth = Match.Where(function (x) {
  return /^[0-9]{1,2}$/.test(x);
});

const ValidExpireYear = Match.Where(function (x) {
  return /^[0-9]{4}$/.test(x);
});

const ValidCVV = Match.Where(function (x) {
  return /^[0-9]{3,4}$/.test(x);
});

function parseCardData(data) {
  return {
    number: data.number,
    name: data.name,
    cvc: data.cvv2,
    exp_month: data.expire_month,
    exp_year: data.expire_year
  };
}

// Stripe uses a "Decimal-less" format so 10.00 becomes 1000
function formatForStripe(amount) {
  return Math.round(amount * 100);
}
function unformatFromStripe(amount) {
  return (amount / 100);
}

function stripeCaptureCharge(paymentMethod) {
  let result;
  const captureDetails = {
    amount: formatForStripe(paymentMethod.amount)
  };

  try {
    const captureResult = StripeApi.methods.captureCharge.call({
      transactionId: paymentMethod.transactionId,
      captureDetails: captureDetails
    });
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
      error: error
    };
    return { error, result };
  }
  return result;
}


Meteor.methods({
  "stripeSubmit": function (transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: ValidCardNumber,
      expire_month: ValidExpireMonth,
      expire_year: ValidExpireYear,
      cvv2: ValidCVV,
      type: String
    });
    check(paymentData, {
      total: String,
      currency: String
    });

    const chargeObj = {
      amount: "",
      currency: "",
      card: {},
      capture: true
    };

    if (transactionType === "authorize") {
      chargeObj.capture = false;
    }
    chargeObj.card = parseCardData(cardData);
    chargeObj.amount = formatForStripe(paymentData.total);
    chargeObj.currency = paymentData.currency;
    let result;
    let chargeResult;

    try {
      chargeResult = StripeApi.methods.createCharge.call({ chargeObj });
      if (chargeResult && chargeResult.status === "succeeded") {
        result = {
          saved: true,
          response: chargeResult
        };
      } else {
        Logger.debug("Stripe Call succeeded but charge failed");
        result = {
          saved: false,
          error: chargeResult.error.message
        };
      }
      return result;
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error("error", e.message);
    }
  },

  /**
   * Capture a Stripe charge
   * @see https://stripe.com/docs/api#capture_charge
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {Object} results from Stripe normalized
   */
  "stripe/payment/capture": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    // let result;
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
  "stripe/refund/create": function (paymentMethod, amount, reason = "requested_by_customer") {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    check(reason, String);

    const refundDetails = {
      charge: paymentMethod.transactionId,
      amount: formatForStripe(amount),
      reason
    };

    let result;
    try {
      const refundResult = StripeApi.methods.createRefund.call({ refundDetails });
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
      Logger.fatal("Stripe call failed, refund was not issued");
    }
    return result;
  },

  /**
   * List refunds
   * @param  {Object} paymentMethod object
   * @return {Object} result
   */
  "stripe/refund/list": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    let result;
    try {
      const refunds = StripeApi.methods.listRefunds.call({ transactionId: paymentMethod.transactionId });
      result = [];
      for (const refund of refunds.data) {
        result.push({
          type: refund.object,
          amount: refund.amount / 100,
          created: refund.created * 1000,
          currency: refund.currency,
          raw: refund
        });
      }
    } catch (error) {
      Logger.error(error);
      result = { error };
    }
    return result;
  }
});
