/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
// reaction modules
import { Packages } from "/lib/collections";
import { Logger } from "/server/api";

StripeApi = {};
StripeApi.methods = {};


cardSchema = new SimpleSchema({
  number: { type: String },
  name: { type: String },
  cvc: { type: String },
  exp_month: { type: String },
  exp_year: { type: String }
});

chargeObjectSchema = new SimpleSchema({
  amount: { type: Number },
  currency: {type: String},
  card: { type: cardSchema },
  capture: { type: Boolean }
});

captureDetailsSchema = new SimpleSchema({
  amount: { type: Number }
});

refundDetailsSchema = new SimpleSchema({
  charge: { type: String },
  amount: { type: Number },
  metadata: { type: String, optional: true },
  reason: { type: String }
});

// These are errors on the user side that we just want to pass back up to the user
let expectedErrors = [
  "card_declined",
  "incorrect_cvc",
  "expired_card",
  "incorrect_number"
];

StripeApi.methods.getApiKey = new ValidatedMethod({
  name: "StripeApi.methods.getApiKey",
  validate: null,
  run() {
    const settings = Packages.findOne({name: "reaction-stripe"}).settings;
    if (!settings.api_key) {
      throw new Meteor.Error("403", "Invalid Stripe Credentials");
    }
    return settings.api_key;
  }
});


StripeApi.methods.createCharge = new ValidatedMethod({
  name: "StripeApi.methods.createCharge",
  validate: new SimpleSchema({
    chargeObj: { type: chargeObjectSchema },
    apiKey: { type: String, optional: true }
  }).validator(),
  run({ chargeObj, apiKey }) {
    let stripe;
    if (!apiKey) {
      const dynamicApiKey = StripeApi.methods.getApiKey.call();
      stripe = require("stripe")(dynamicApiKey);
    } else {
      stripe = require("stripe")(apiKey);
    }
    try {
      let chargePromise = stripe.charges.create(chargeObj, function (error, result) {
        return {error: error, result: result};
      });
      let promiseResult = Promise.await(chargePromise);
      return promiseResult;
    } catch (e) {
      // Handle "expected" errors differently
      if (e.rawType === "card_error" && _.includes(expectedErrors, e.code)) {
        Logger.info("Error from Stripe is expected, not throwing");
        return {error: e, result: null};
      }
      Logger.warn("Received unexpected error code: " + e.code);
      Logger.warn(e);
      return {error: e, result: null};
    }
  }
});

StripeApi.methods.captureCharge = new ValidatedMethod({
  name: "StripeApi.methods.captureCharge",
  validate: new SimpleSchema({
    transactionId: { type: String },
    captureDetails: { type: captureDetailsSchema },
    apiKey: { type: String, optional: true }
  }).validator(),
  run({ transactionId, captureDetails, apiKey })  {
    let stripe;
    if (!apiKey) {
      const dynamicApiKey = StripeApi.methods.getApiKey.call();
      stripe = require("stripe")(dynamicApiKey);
    } else {
      stripe = require("stripe")(apiKey);
    }
    let capturePromise = stripe.charges.capture(transactionId, captureDetails, function (error, result) {
      return {error: error, result: result};
    });
    let captureResults = Promise.await(capturePromise);
    return captureResults;
  }
});

StripeApi.methods.createRefund = new ValidatedMethod({
  name: "StripeApi.methods.createRefund",
  validate: new SimpleSchema({
    refundDetails: { type: refundDetailsSchema },
    apiKey: { type: String, optional: true }
  }).validator(),
  run({ refundDetails, apiKey }) {
    let stripe;
    if (!apiKey) {
      const dynamicApiKey = StripeApi.methods.getApiKey.call();
      stripe = require("stripe")(dynamicApiKey);
    } else {
      stripe = require("stripe")(apiKey);
    }
    let refundPromise = stripe.refunds.create({
      charge: refundDetails.charge,
      amount: refundDetails.amount
    }, function (error, result) {
      return {error: error, result: result};
    });

    let refundResults = Promise.await(refundPromise);
    return refundResults;
  }
});

StripeApi.methods.listRefunds = new ValidatedMethod({
  name: "StripeApi.methods.listRefunds",
  validate: new SimpleSchema({
    transactionId: { type: String },
    apiKey: { type: String, optional: true }
  }).validator(),
  run({ transactionId, apiKey }) {
    let stripe;
    if (!apiKey) {
      const dynamicApiKey = StripeApi.methods.getApiKey.call();
      stripe = require("stripe")(dynamicApiKey);
    } else {
      stripe = require("stripe")(apiKey);
    }
    let refundListPromise = stripe.refunds.list({ charge: transactionId }, function (error, result) {
      return {error: error, result: result};
    });
    let refundListResults = Promise.await(refundListPromise);
    return refundListResults;
  }
});
