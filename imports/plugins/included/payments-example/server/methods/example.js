/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
// reaction modules
import Logger from "@reactioncommerce/logger";
import { ValidCardNumber, ValidExpireMonth, ValidExpireYear, ValidCVV } from "/lib/api";
import { ExampleApi } from "./exampleapi";

// function chargeObj() {
//   return {
//     amount: "",
//     currency: "",
//     card: {},
//     capture: true
//   };
// }

// function parseCardData(data) {
//   return {
//     number: data.number,
//     name: data.name,
//     cvc: data.cvv2,
//     expireMonth: data.expire_month,
//     expireYear: data.expire_year
//   };
// }

/**
 * Meteor methods for Example Payment Plugin. Run these methods using `Meteor.call()`
 * @namespace Payment/Example/Methods
 */


Meteor.methods({
  /**
   * Submit a card for Authorization
   * @method
   * @memberof Payment/Example/Methods
   * @param  {Object} transactionType authorize or capture
   * @param  {Object} cardData card Details
   * @param  {Object} paymentData The details of the Payment Needed
   * @return {Object} results normalized
   */
  "exampleSubmit"(transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: ValidCardNumber,
      expireMonth: ValidExpireMonth,
      expireYear: ValidExpireYear,
      cvv2: ValidCVV,
      type: String
    });

    check(paymentData, {
      total: String,
      currency: String
    });
    const total = parseFloat(paymentData.total);
    let result;
    try {
      const transaction = ExampleApi.methods.authorize.call({
        transactionType,
        cardData,
        paymentData
      });

      result = {
        saved: true,
        status: "created",
        currency: paymentData.currency,
        amount: total,
        riskLevel: normalizeRiskLevel(transaction),
        transactionId: transaction.id,
        response: {
          amount: total,
          transactionId: transaction.id,
          currency: paymentData.currency
        }
      };
    } catch (error) {
      Logger.warn(error);
      result = {
        saved: false,
        error
      };
    }
    return result;
  },

  /**
   * Capture a Charge
   * @method
   * @memberof Payment/Example/Methods
   * @param {Object} payment Object containing data about the transaction to capture
   * @return {Object} results normalized
   */
  "example/payment/capture"(payment) {
    check(payment, Object);

    const { amount, transactionId: authorizationId } = payment;
    const response = ExampleApi.methods.capture.call({
      authorizationId,
      amount
    });
    const result = {
      saved: true,
      response
    };
    return result;
  },

  /**
   * Create a refund
   * @method
   * @memberof Payment/Example/Methods
   * @param  {Object} payment object
   * @param  {Number} amount The amount to be refunded
   * @return {Object} result
   */
  "example/refund/create"(payment, amount) {
    check(amount, Number);
    check(payment, Object);

    const { transactionId } = payment;
    const response = ExampleApi.methods.refund.call({
      transactionId,
      amount
    });
    const results = {
      saved: true,
      response
    };
    return results;
  },

  /**
   * List refunds
   * @method
   * @memberof Payment/Example/Methods
   * @param  {Object} payment Object containing the payment data
   * @return {Object} result
   */
  "example/refund/list"(payment) {
    check(payment, Object);

    const { transactionId } = payment;
    const response = ExampleApi.methods.refunds.call({
      transactionId
    });
    const result = [];
    for (const refund of response.refunds) {
      result.push(refund);
    }

    // The results retured from the GenericAPI just so happen to look like exactly what the dashboard
    // wants. The return package should ba an array of objects that look like this
    // {
    //   type: "refund",
    //   amount: Number,
    //   created: Number: Epoch Time,
    //   currency: String,
    //   raw: Object
    // }
    const emptyResult = [];
    return emptyResult;
  }
});

/**
 * @method normalizeRiskLevel
 * @private
 * @summary Normalizes the risk level response of a transaction to the values defined in payment schema
 * @param  {object} transaction - The transaction that we need to normalize
 * @return {string} normalized status string - either elevated, high, or normal
 */
function normalizeRiskLevel(transaction) {
  // the values to be checked against will depend on the return codes/values from the payment API
  if (transaction.riskStatus === "low_risk_level") {
    return "elevated";
  }

  if (transaction.riskStatus === "highest_risk_level") {
    return "high";
  }

  // default to normal if no other flagged
  return "normal";
}
