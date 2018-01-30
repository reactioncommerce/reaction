/* eslint camelcase: 0 */
/* eslint prefer-arrow-callback:0 */
import nock from "nock";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { utils } from "./stripe";

const stripeCaptureResult = {
  id: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
  object: "charge",
  amount: 1999,
  amount_refunded: 0,
  application_fee: null,
  balance_transaction: "txn_17hZ6OBXXkbZQs3xvtVtXtQ3",
  captured: true,
  created: 1456206682,
  currency: "usd",
  customer: null,
  description: null,
  destination: null,
  dispute: null,
  failure_code: null,
  failure_message: null,
  fraud_details: {},
  invoice: null,
  livemode: false,
  metadata: {},
  order: null,
  paid: true,
  receipt_email: null,
  receipt_number: null,
  refunded: false,
  refunds: {
    object: "list",
    data: [],
    has_more: false,
    total_count: 0,
    url: "/v1/charges/ch_17hZ4wBXXkbZQs3xL5JhlSgS/refunds"
  },
  shipping: null,
  source: {
    id: "card_17hZ4wBXXkbZQs3xRVgvZONw",
    object: "card",
    address_city: null,
    address_country: null,
    address_line1: null,
    address_line1_check: null,
    address_line2: null,
    address_state: null,
    address_zip: null,
    address_zip_check: null,
    brand: "Visa",
    country: "US",
    customer: null,
    cvc_check: "pass",
    dynamic_last4: null,
    exp_month: 3,
    exp_year: 2019,
    fingerprint: "sMf9T3BK8Si2Nqme",
    funding: "credit",
    last4: "4242",
    metadata: {},
    name: "Brent Hoover",
    tokenization_method: null
  },
  statement_descriptor: null,
  status: "succeeded"
};

describe("stripe/payment/capture", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call StripeApi.methods.captureCharge with the proper parameters and return saved = true", function (done) {
    const paymentPackageId = Random.id();
    const paymentMethod = {
      processor: "Stripe",
      storedCard: "Visa 4242",
      paymentPackageId,
      paymentSettingsKey: "reaction-stripe",
      method: "credit",
      transactionId: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
      amount: 19.99,
      status: "approved",
      mode: "capture",
      createdAt: new Date()
    };

    // Stripe Charge Nock
    nock("https://api.stripe.com:443")
      .post(`/v1/charges/${paymentMethod.transactionId}/capture`)
      .reply(200, stripeCaptureResult); // .log(console.log);

    sandbox.stub(utils, "getStripeApi", function () {
      return "sk_fake_fake";
    });

    let captureResult = null;
    let captureError = null;
    Meteor.call("stripe/payment/capture", paymentMethod, function (error, result) {
      captureResult = result;
      captureError = error;
      expect(captureError).to.be.undefined;
      expect(captureResult).to.not.be.undefined;
      expect(captureResult.saved).to.be.true;
      done();
    });
  });
});

describe("stripe/payment/capture", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should should return an error if transactionId is not available", function (done) {
    const paymentMethod = {
      processor: "Stripe",
      storedCard: "Visa 4242",
      paymentPackageId: "vrXutd72c2m7Lenqw",
      paymentSettingsKey: "reaction-stripe",
      method: "credit",
      amount: 19.99,
      status: "approved",
      mode: "capture",
      createdAt: new Date()
    };

    // Stripe Charge Nock
    nock("https://api.stripe.com:443")
      .post(`/v1/charges/${paymentMethod.transactionId}/capture`)
      .reply(200, stripeCaptureResult); // .log(console.log);

    sandbox.stub(utils, "getStripeApi", function () {
      return "sk_fake_fake";
    });

    Meteor.call("stripe/payment/capture", paymentMethod, function (error, result) {
      expect(error.message).to.equal("[Transaction ID is required]");
      expect(result).to.be.undefined;
      done();
    });
  });
});

