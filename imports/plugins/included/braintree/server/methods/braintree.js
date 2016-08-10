import accounting from "accounting-js";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import Future from "fibers/future";
import Braintree from "braintree";
import { BraintreeApi } from "./braintreeapi";
import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";
import { PaymentMethod } from "/lib/collections/schemas";

function getSettings(settings, ref, valueName) {
  if (settings !== null) {
    return settings[valueName];
  } else if (ref !== null) {
    return ref[valueName];
  }
  return undefined;
}


function getAccountOptions() {
  let environment;
  let settings = Packages.findOne({
    name: "reaction-braintree",
    shopId: Reaction.getShopId(),
    enabled: true
  }).settings;
  if (typeof settings !== "undefined" && settings !== null ? settings.mode : undefined === true) {
    environment = "production";
  } else {
    environment = "sandbox";
  }

  let ref = Meteor.settings.braintree;
  let options = {
    environment: environment,
    merchantId: getSettings(settings, ref, "merchant_id"),
    publicKey: getSettings(settings, ref, "public_key"),
    privateKey: getSettings(settings, ref, "private_key")
  };
  if (!options.merchantId) {
    throw new Meteor.Error("invalid-credentials", "Invalid Braintree Credentials");
  }
  return options;
}


function getGateway() {
  let accountOptions = getAccountOptions();
  if (accountOptions.environment === "production") {
    accountOptions.environment = Braintree.Environment.Production;
  } else {
    accountOptions.environment = Braintree.Environment.Sandbox;
  }
  let gateway = Braintree.connect(accountOptions);
  return gateway;
}

function getPaymentObj() {
  return {
    amount: "",
    options: {submitForSettlement: true}
  };
}

function parseCardData(data) {
  return {
    cardholderName: data.name,
    number: data.number,
    expirationMonth: data.expirationMonth,
    expirationYear: data.expirationYear,
    cvv: data.cvv
  };
}

Meteor.methods({
  /**
   * braintreeSubmit
   * Authorize, or authorize and capture payments from Brinatree
   * https://developers.braintreepayments.com/reference/request/transaction/sale/node
   * @param {String} transactionType - either authorize or capture
   * @param {Object} cardData - Object containing everything about the Credit card to be submitted
   * @param {Object} paymentData - Object containing everything about the transaction to be settled
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintreeSubmit": function (transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: String,
      expirationMonth: String,
      expirationYear: String,
      cvv2: String,
      type: String
    });
    check(paymentData, {
      total: String,
      currency: String
    });
    let gateway = getGateway();
    let paymentObj = getPaymentObj();
    if (transactionType === "authorize") {
      paymentObj.options.submitForSettlement = false;
    }
    paymentObj.creditCard = parseCardData(cardData);
    paymentObj.amount = paymentData.total;
    let fut = new Future();
    gateway.transaction.sale(paymentObj, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut.return({
          saved: false,
          error: error
        });
      } else if (!result.success) {
        fut.return({
          saved: false,
          response: result
        });
      } else {
        fut.return({
          saved: true,
          response: result
        });
      }
    }, function (error) {
      Reaction.Events.warn(error);
    }));
    return fut.wait();
  },


  /**
   * braintree/payment/capture
   * Capture payments from Braintree
   * https://developers.braintreepayments.com/reference/request/transaction/submit-for-settlement/node
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintree/payment/capture": function (paymentMethod) {
    check(paymentMethod, PaymentMethod);
    let transactionId = paymentMethod.transactions[0].transaction.id;
    let amount = accounting.toFixed(paymentMethod.amount, 2);
    let gateway = getGateway();
    const fut = new Future();
    this.unblock();

    if (amount === accounting.toFixed(0, 2)) {
      gateway.transaction.void(transactionId, function (error, result) {
        if (error) {
          fut.return({
            saved: false,
            error: error
          });
        } else {
          fut.return({
            saved: true,
            response: result
          });
        }
      }, function (e) {
        Logger.warn(e);
      });
      return fut.wait();
    }
    gateway.transaction.submitForSettlement(transactionId, amount, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut.return({
          saved: false,
          error: error
        });
      } else {
        fut.return({
          saved: true,
          response: result
        });
        gateway.testing.settle(transactionId, function (err, settleResult) {
          settleResult.success;
          // true

          settleResult.transaction.status;
          // Transaction.Status.Settled
        });
      }
    }, function (e) {
      Logger.warn(e);
    }));
    return fut.wait();
  },
  /**
   * braintree/refund/create
   * Refund BrainTree payment
   * https://developers.braintreepayments.com/reference/request/transaction/refund/node
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @param {Number} amount - Amount to be refunded if not the entire amount
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintree/refund/create-old": function (paymentMethod, amount) {
    check(paymentMethod, PaymentMethod);
    check(amount, Number);
    let transactionId = paymentMethod.transactionId;
    let gateway = getGateway();
    const fut = new Future();
    gateway.transaction.refund(transactionId, amount, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut.return({
          saved: false,
          error: error
        });
      } else if (!result.success) {
        if (result.errors.errorCollections.transaction.validationErrors.base[0].code === "91506") {
          fut.return({
            saved: false,
            error: "Braintree does not allow refunds until transactions are settled. This can take up to 24 hours. Please try again later."
          });
        } else {
          fut.return({
            saved: false,
            error: result.message
          });
        }
      } else {
        fut.return({
          saved: true,
          response: result
        });
      }
    }, function (e) {
      Logger.fatal(e);
    }));
    return fut.wait();
  },








  /**
   * braintree/refund/create2
   * Refund BrainTree payment
   * https://developers.braintreepayments.com/reference/request/transaction/refund/node
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @param {Number} amount - Amount to be refunded if not the entire amount
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintree/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, PaymentMethod);
    check(amount, Number);

    const refundDetails = {
      transactionId: paymentMethod.transactionId,
      amount: amount
    };

    let result;

    try {
      let refundResult = BraintreeApi.methods.createRefund.call({ refundDetails });
      Logger.info(refundResult);
      // if (refundResult.object === "refund") {
      // if (refundResult.response.transaction.type === "credit") {
      if (refundResult.response.transaction.type === "credit") {
        result = {
          saved: true,
          response: refundResult
        };
      } else {
        result = {
          saved: false,
          response: refundResult
        };
        Logger.warn("Braintree call succeeded but refund not issued");
      }
    } catch (error) {
      Logger.error(error);
      result = {
        saved: false,
        error: `Cannot issue refund: ${error.message}`
      };
      Logger.fatal("Braintree call failed, refund was not issued");
    }
    return result;
  },

  /**
   * braintree/refund/list
   * List all refunds for a transaction
   * https://developers.braintreepayments.com/reference/request/transaction/find/node
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @return {Array} results - An array of refund objects for display in admin
   */
  "braintree/refund/list": function (paymentMethod) {
    check(paymentMethod, Object);
    let transactionId = paymentMethod.transactionId;
    let gateway = getGateway();
    this.unblock();
    let braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
    let findResults = braintreeFind(transactionId);
    let result = [];
    if (findResults.refundIds.length > 0) {
      for (let refund of findResults.refundIds) {
        let refundDetails = getRefundDetails(refund);
        result.push({
          type: "refund",
          amount: parseFloat(refundDetails.amount),
          created: moment(refundDetails.createdAt).unix() * 1000,
          currency: refundDetails.currencyIsoCode,
          raw: refundDetails
        });
      }
    }
    return result;
  }
});

getRefundDetails = function (refundId) {
  check(refundId, String);
  let gateway = getGateway();
  let braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
  let findResults = braintreeFind(refundId);
  return findResults;
};
