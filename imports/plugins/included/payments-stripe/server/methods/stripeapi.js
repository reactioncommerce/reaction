/* eslint camelcase: 0 */
import _ from "lodash";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Logger } from "/server/api";

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


StripeApi.methods.createCharge = new ValidatedMethod({
  name: "StripeApi.methods.createCharge",
  validate: new SimpleSchema({
    chargeObj: { type: chargeObjectSchema },
    apiKey: { type: String }
  }).validator(),
  run({ chargeObj, apiKey }) {
    const stripe = require("stripe")(apiKey);
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
  }
});

StripeApi.methods.captureCharge = new ValidatedMethod({
  name: "StripeApi.methods.captureCharge",
  validate: new SimpleSchema({
    transactionId: { type: String },
    captureDetails: { type: captureDetailsSchema },
    apiKey: { type: String }
  }).validator(),
  run({ transactionId, captureDetails, apiKey })  {
    const stripe = require("stripe")(apiKey);
    const capturePromise = stripe.charges.capture(transactionId, captureDetails);
    const captureResults = Promise.await(capturePromise);
    return captureResults;
  }
});

StripeApi.methods.createRefund = new ValidatedMethod({
  name: "StripeApi.methods.createRefund",
  validate: new SimpleSchema({
    refundDetails: { type: refundDetailsSchema },
    apiKey: { type: String }
  }).validator(),
  run({ refundDetails, apiKey }) {
    const stripe = require("stripe")(apiKey);
    const refundPromise = stripe.refunds.create({ charge: refundDetails.charge, amount: refundDetails.amount });
    const refundResults = Promise.await(refundPromise);
    return refundResults;
  }
});

StripeApi.methods.listRefunds = new ValidatedMethod({
  name: "StripeApi.methods.listRefunds",
  validate: new SimpleSchema({
    transactionId: { type: String },
    apiKey: { type: String }
  }).validator(),
  run({ transactionId, apiKey }) {
    const stripe = require("stripe")(apiKey);
    const refundListPromise = stripe.refunds.list({ charge: transactionId });
    const refundListResults = Promise.await(refundListPromise);
    return refundListResults;
  }
});
