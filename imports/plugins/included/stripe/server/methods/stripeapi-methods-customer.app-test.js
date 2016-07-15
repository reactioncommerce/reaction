/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { StripeApi } from "./stripeapi";

let stripeCustomerResult = {
  id: "cus_8oZQ1MXGlu2yvN",
  object: "customer",
  account_balance: 0,
  created: 1468450621,
  currency: "usd",
  default_source: null,
  delinquent: false,
  description: null,
  discount: null,
  email: null,
  livemode: false,
  metadata: {
  },
  shipping: null,
  sources: {
    object: "list",
    data: [

    ],
    has_more: false,
    total_count: 0,
    url: "/v1/customers/cus_8oZQ1MXGlu2yvN/sources"
  },
  subscriptions: {
    object: "list",
    data: [

    ],
    has_more: false,
    total_count: 0,
    url: "/v1/customers/cus_8oZQ1MXGlu2yvN/subscriptions"
  }
};

let stripeChargeResult = {
  id: "ch_17hA8DBXXkbZQs3xENUmN9bZ",
  object: "charge",
  amount: 2298,
  amount_refunded: 0,
  captured: false,
  created: 1456110785,
  currency: "usd",
  refunded: false,
  shipping: null,
  source: {
    id: "card_17hA8DBXXkbZQs3xclGesDrp",
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
    name: "Test User",
    tokenization_method: null
  },
  statement_descriptor: null,
  status: "succeeded"
};
// TODO: Create testing for customer creation in stripe (1/2)
// TODO: Create testing for auto capture in stripe

describe("Stripe.charge createCustomer", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call StripeApi.methods.createCustomer if customer bool is set, return customerId", function (done) {
    let card = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4242424242424242",
      type: "visa"
    };
    let total = "22.98";
    let currency = "USD";
    sandbox.stub(StripeApi.methods.getCreateCustomerSetting, "call", function () {
      return true;
    });
    sandbox.stub(StripeApi.methods.createCustomer, "call", function () {
      return stripeCustomerResult;
    });
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeChargeResult;
    });

    let chargeResult = null;
    Meteor.call("stripeSubmit", "charge", card, {total: total, currency: currency}, function (error, result) {
      expect(error).to.be.undefined;
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.true;
    expect(chargeResult.response.customerId).to.equal(stripeCustomerResult.id);
    done();
  });

  it("should not call StripeApi.methods.createCustomer if customer bool is set false", function (done) {
    let card = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4242424242424242",
      type: "visa"
    };
    let total = "22.98";
    let currency = "USD";
    sandbox.stub(StripeApi.methods.getCreateCustomerSetting, "call", function () {
      return false;
    });
    sandbox.stub(StripeApi.methods.createCustomer, "call", function () {
      return stripeCustomerResult;
    });
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeChargeResult;
    });

    let chargeResult = null;
    Meteor.call("stripeSubmit", "charge", card, {total: total, currency: currency}, function (error, result) {
      expect(error).to.be.undefined;
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.true;
    expect(chargeResult.response.customerId).to.be.undefined;
    done();
  });
});
