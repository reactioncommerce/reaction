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


// export const cardSchema = new SimpleSchema({
//   number: { type: String },
//   name: { type: String },
//   cvc: { type: String },
//   exp_month: { type: String },
//   exp_year: { type: String }
// });
//
// export const chargeObjectSchema = new SimpleSchema({
//   amount: { type: Number },
//   currency: {type: String},
//   card: { type: cardSchema },
//   capture: { type: Boolean }
// });
//
// export const captureDetailsSchema = new SimpleSchema({
//   amount: { type: Number }
// });

export const refundDetailsSchema = new SimpleSchema({
  transactionId: { type: String },
  amount: { type: Number, decimal: true }
});

// // These are errors on the user side that we just want to pass back up to the user
// const expectedErrors = [
//   "card_declined",
//   "incorrect_cvc",
//   "expired_card",
//   "incorrect_number"
// ];

// BraintreeApi.methods.getApiKey = new ValidatedMethod({
//   name: "BraintreeApi.methods.getApiKey",
//   validate: null,
//   run() {
//     const settings = Packages.findOne({ name: "reaction-braintree" }).settings;
//     if (!settings.api_key) {
//       throw new Meteor.Error("403", "Invalid Braintree Credentials");
//     }
//     return settings.api_key;
//   }
// });

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
