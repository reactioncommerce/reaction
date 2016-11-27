/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
// reaction modules
import { Packages } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import Future from "fibers/future";
import Braintree from "braintree";
import accounting from "accounting-js";

export const BraintreeApi = {};
BraintreeApi.apiCall = {};


function getPaymentObj() {
  return {
    amount: "",
    options: { submitForSettlement: true }
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
  const settings = Packages.findOne({
    name: "reaction-braintree",
    shopId: Reaction.getShopId(),
    enabled: true
  }).settings;
  if (typeof settings !== "undefined" && settings !== null ? settings.mode : undefined === true) {
    environment = "production";
  } else {
    environment = "sandbox";
  }

  const ref = Meteor.settings.braintree;
  const options = {
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
  const accountOptions = getAccountOptions();
  if (accountOptions.environment === "production") {
    accountOptions.environment = Braintree.Environment.Production;
  } else {
    accountOptions.environment = Braintree.Environment.Sandbox;
  }
  const gateway = Braintree.connect(accountOptions);
  return gateway;
}

getRefundDetails = function (refundId) {
  check(refundId, String);
  const gateway = getGateway();
  const braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
  const findResults = braintreeFind(refundId);
  return findResults;
};


BraintreeApi.apiCall.paymentSubmit = function (paymentSubmitDetails) {
  const gateway = getGateway();
  const paymentObj = getPaymentObj();
  if (paymentSubmitDetails.transactionType === "authorize") {
    paymentObj.options.submitForSettlement = false;
  }
  paymentObj.creditCard = parseCardData(paymentSubmitDetails.cardData);
  paymentObj.amount = paymentSubmitDetails.paymentData.total;
  const fut = new Future();
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
};


BraintreeApi.apiCall.captureCharge = function (paymentCaptureDetails) {
  const transactionId = paymentCaptureDetails.transactionId;
  const amount = accounting.toFixed(paymentCaptureDetails.amount, 2);
  const gateway = getGateway();
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
    }
  }, function (e) {
    Logger.warn(e);
  }));

  return fut.wait();
};


BraintreeApi.apiCall.createRefund = function (refundDetails) {
  const transactionId = refundDetails.transactionId;
  const amount = refundDetails.amount;
  const gateway = getGateway();
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
};


BraintreeApi.apiCall.listRefunds = function (refundListDetails) {
  const transactionId = refundListDetails.transactionId;
  const gateway = getGateway();
  const braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
  const findResults = braintreeFind(transactionId);
  const result = [];
  if (findResults.refundIds.length > 0) {
    for (const refund of findResults.refundIds) {
      const refundDetails = getRefundDetails(refund);
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
};
