/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
// reaction modules
import { Packages } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import Future from "fibers/future";
import Braintree from "braintree";
import accounting from "accounting-js";


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

getRefundDetails = function (refundId) {
  check(refundId, String);
  let gateway = getGateway();
  let braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
  let findResults = braintreeFind(refundId);
  return findResults;
};


export function paymentSubmit(paymentSubmitDetails){
  let gateway = getGateway();
  let paymentObj = getPaymentObj();
  if (paymentSubmitDetails.transactionType === "authorize") {
    paymentObj.options.submitForSettlement = false;
  }
  paymentObj.creditCard = parseCardData(paymentSubmitDetails.cardData);
  paymentObj.amount = paymentSubmitDetails.paymentData.total;
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
}


export function captureCharge(paymentCaptureDetails) {
  let transactionId = paymentCaptureDetails.transactionId;
  let amount = accounting.toFixed(paymentCaptureDetails.amount, 2);
  let gateway = getGateway();
  const fut = new Future();

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
      //This is here for ease while testing, and will be removed before it's live
      //This is here for ease while testing, and will be removed before it's live
      //This is here for ease while testing, and will be removed before it's live
      //This is here for ease while testing, and will be removed before it's live
      gateway.testing.settle(transactionId, function (err, settleResult) {
        settleResult.success
        // true

        settleResult.transaction.status
        // Transaction.Status.Settled
      });
      //This is here for ease while testing, and will be removed before it's live
      //This is here for ease while testing, and will be removed before it's live
      //This is here for ease while testing, and will be removed before it's live
      //This is here for ease while testing, and will be removed before it's live
    }
  }, function (e) {
    Logger.warn(e);
  }));

  return fut.wait();
}


export function createRefund(refundDetails) {
  let transactionId = refundDetails.transactionId;
  let amount = refundDetails.amount;
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
}


export function listRefunds(refundListDetails) {
  let transactionId = refundListDetails.transactionId;
  let gateway = getGateway();
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
