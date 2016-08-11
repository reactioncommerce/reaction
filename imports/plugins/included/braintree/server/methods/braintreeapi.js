/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
// reaction modules
import { Packages } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import Future from "fibers/future";
import Braintree from "braintree";

export const BraintreeApi = {};
BraintreeApi.methods = {};

export const refundDetailsSchema = new SimpleSchema({
  transactionId: { type: String },
  amount: { type: Number, decimal: true }
});

export const refundListSchema = new SimpleSchema({
  transactionId: { type: String }
});


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


// BraintreeApi.methods.createCharge = new ValidatedMethod({
//   name: "BraintreeApi.methods.createCharge",
//   validate: new SimpleSchema({
//     refundDetails: { type: refundDetailsSchema } //UPDATE
//   }).validator(),
//   run({ refundDetails }) { //UPDATE
//   }
// });


// BraintreeApi.methods.captureCharge = new ValidatedMethod({
//   name: "BraintreeApi.methods.captureCharge",
//   validate: new SimpleSchema({
//     refundDetails: { type: refundDetailsSchema } //UPDATE
//   }).validator(),
//   run({ refundDetails }) { //UPDATE
//   }
// });


BraintreeApi.methods.createRefund = new ValidatedMethod({
  name: "BraintreeApi.methods.createRefund",
  validate: new SimpleSchema({
    refundDetails: { type: refundDetailsSchema }
  }).validator(),
  run({ refundDetails }) {
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
});


BraintreeApi.methods.listRefunds = new ValidatedMethod({
  name: "BraintreeApi.methods.listRefunds",
  validate: new SimpleSchema({
    refundListDetails: { type: refundListSchema }
  }).validator(),
  run({ refundListDetails }) {
    let transactionId = refundListDetails.transactionId;
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
