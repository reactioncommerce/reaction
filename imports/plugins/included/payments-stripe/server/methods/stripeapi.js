/* eslint camelcase: 0 */
import _ from "lodash";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Reaction, Logger } from "/server/api";

export const StripeApi = {};
StripeApi.methods = {};


export const cardSchema = new SimpleSchema({
  number: { type: String },
  name: { type: String },
  cvc: { type: String },
  exp_month: { type: String },
  exp_year: { type: String }
});

export const chargeObjectSchema = new SimpleSchema({
  amount: { type: Number },
  currency: { type: String },
  card: { type: cardSchema },
  capture: { type: Boolean }
});

export const captureDetailsSchema = new SimpleSchema({
  amount: { type: Number }
});

export const refundDetailsSchema = new SimpleSchema({
  charge: { type: String },
  amount: { type: Number },
  metadata: { type: String, optional: true },
  reason: { type: String }
});

// These are errors on the user side that we just want to pass back up to the user
const expectedErrors = [
  "card_declined",
  "incorrect_cvc",
  "expired_card",
  "incorrect_number"
];

StripeApi.methods.getApiKey = function () {
  const stripePkg = Reaction.getPackageSettingsWithOptions({
    shopId: Reaction.getPrimaryShopId(),
    name: "reaction-stripe"
  });
  if (stripePkg || stripePkg.settings && stripePkg.settings.api_key) {
    return stripePkg.settings.api_key;
  }
  throw new Meteor.Error("invalid-credentials", "Invalid Stripe Credentials");
};


StripeApi.methods.createCharge = function({ chargeObj, apiKey }) {
  check(chargeObj, chargeObjectSchema);

  const stripeKey = apiKey || StripeApi.methods.getApiKey();
  const stripe = require("stripe")(stripeKey);
  try {
    const chargePromise = stripe.charges.create(chargeObj);
    const promiseResult = Promise.await(chargePromise);
    return promiseResult;
  } catch (e) {
    // Handle "expected" errors differently
    if (e.rawType === "card_error" && _.includes(expectedErrors, e.code)) {
      Logger.debug("Error from Stripe is expected, not throwing");
      const normalizedError = {
        details: e.message
      };
      return { error: normalizedError, result: null };
    }
    Logger.error("Received unexpected error type: " + e.rawType);
    Logger.error(e);

    // send raw error to server log, but sanitized version to client
    const sanitisedError = {
      details: "An unexpected error has occurred"
    };
    return { error: sanitisedError, result: null };
  }
};


StripeApi.methods.captureCharge = function ({ transactionId, captureDetails, apiKey }) {
  check(transactionId, String);
  check(captureDetails, captureDetailsSchema);

  const stripeKey = apiKey || StripeApi.methods.getApiKey();
  const stripe = require("stripe")(stripeKey);
  const capturePromise = stripe.charges.capture(transactionId, captureDetails);
  const captureResults = Promise.await(capturePromise);
  return captureResults;
};

StripeApi.methods.createRefund = function ({ refundDetails, apiKey }) {
  check(refundDetails, refundDetailsSchema);

  const stripeKey = apiKey || StripeApi.methods.getApiKey();
  const stripe = require("stripe")(stripeKey);
  const refundPromise = stripe.refunds.create({ charge: refundDetails.charge, amount: refundDetails.amount });
  const refundResults = Promise.await(refundPromise);
  return refundResults;
};

StripeApi.methods.listRefunds = function ({ transactionId, apiKey }) {
  check(transactionId, String);

  const stripeKey = apiKey || StripeApi.methods.getApiKey();
  const stripe = require("stripe")(stripeKey);
  try {
    const refundListPromise = stripe.refunds.list({ charge: transactionId });
    const refundListResults = Promise.await(refundListPromise);
    return refundListResults;
  } catch (error) {
    // Logger.error("Encountered an error when trying to list refunds", error);
    Logger.error("Encountered an error when trying to list refunds");
  }
};
