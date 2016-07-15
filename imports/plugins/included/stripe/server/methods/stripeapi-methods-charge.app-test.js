/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { StripeApi } from "./stripeapi";
import { Stripe } from "../../lib/api";

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

describe("Stripe.charge", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call StripeApi.methods.createCharge with paymentCaptureSetting as false and authorize a charge", function (done) {
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
    sandbox.stub(StripeApi.methods.getPaymentCaptureSetting, "call", function () {
      return false;
    });
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeChargeResult;
    });

    let chargeResult = null;
    Meteor.call("stripeSubmit", "charge", card, {total: total, currency: currency}, function (error, result) {
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.true;
    expect(chargeResult.response.captured).to.be.false;
    done();
  });

  it("should call StripeApi.methods.createCharge with paymentCaptureSetting as true and capture a charge", function (done) {
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
    sandbox.stub(StripeApi.methods.getPaymentCaptureSetting, "call", function () {
      return true;
    });
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return Object.assign(stripeChargeResult, {captured: true});
    });

    let chargeResult = null;
    Meteor.call("stripeSubmit", "charge", card, {total: total, currency: currency}, function (error, result) {
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.true;
    expect(chargeResult.response.captured).to.be.true;
    done();
  });
});

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

describe("Meteor.Stripe.charge", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should properly charge a card when using a currency besides USD", function () {
    let card = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4242424242424242",
      type: "visa"
    };
    let total = "22.98";
    let currency = "EUR";

    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeChargeResult;
    });

    let chargeResult = null;
    Stripe.charge(card, {total: total, currency: currency}, function (error, result) {
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.true;
    expect(StripeApi.methods.createCharge.call).to.have.been.calledWith({
      chargeObj: {
        amount: 2298,
        currency: "EUR",
        card: {
          number: "4242424242424242",
          name: "Test User",
          cvc: "345",
          exp_month: "4",
          exp_year: "2019"
        }, capture: false
      }
    });
  });
});

describe("Meteor.Stripe.charge", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should return saved = false when card is declined", function () {
    let card = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4000000000000002",
      type: "visa"
    };
    let total = "22.98";
    let currency = "EUR";

    let stripeDeclineResult =
      {
        result: null,
        error: {
          type: "StripeCardError",
          rawType: "card_error",
          code: "card_declined",
          param: undefined,
          message: "Your card was declined.",
          detail: undefined,
          raw: {
            message: "Your card was declined.",
            type: "card_error",
            code: "card_declined",
            charge: "ch_17hXeXBXXkbZQs3x3lpNoH9l",
            statusCode: 402,
            requestId: "req_7xSZItk9XdVUIJ"
          },
          requestId: "req_7xSZItk9XdVUIJ",
          statusCode: 402
        }
      };
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeDeclineResult;
    });

    let chargeResult = null;
    Stripe.charge(card, {total: total, currency: currency}, function (error, result) {
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.false;
    expect(chargeResult.error).to.equal("Your card was declined.");
    expect(StripeApi.methods.createCharge.call).to.have.been.calledWith({
      chargeObj: {
        amount: 2298,
        currency: "EUR",
        card: {
          number: "4000000000000002",
          name: "Test User",
          cvc: "345",
          exp_month: "4",
          exp_year: "2019"
        }, capture: false
      }
    });
  });
});

describe("Meteor.Stripe.charge", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should return saved = false when an expired card is returned", function () {
    // Note that this test number makes the Stripe API return this error, it is
    // not looking at the actual expiration date.
    let card = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4000000000000069",
      type: "visa"
    };
    let total = "22.98";
    let currency = "USD";

    let stripeExpiredCardResult =
      {
        result: null,
        error: {
          type: "StripeCardError",
          rawType: "card_error",
          code: "expired_card",
          param: "exp_month",
          message: "Your card has expired.",
          raw: {
            message: "Your card has expired.",
            type: "card_error",
            param: "exp_month",
            code: "expired_card",
            charge: "ch_17iBsDBXXkbZQs3xfZArVPEd",
            statusCode: 402,
            requestId: "req_7y88CojR2UJYOd"
          },
          requestId: "req_7y88CojR2UJYOd",
          statusCode: 402
        }
      };
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeExpiredCardResult;
    });

    let chargeResult = null;
    Stripe.charge(card, {total: total, currency: currency}, function (error, result) {
      chargeResult = result;
    });

    expect(chargeResult).to.not.be.undefined;
    expect(chargeResult.saved).to.be.false;
    expect(chargeResult.error).to.equal("Your card has expired.");
    expect(StripeApi.methods.createCharge.call).to.have.been.calledWith({
      chargeObj: {
        amount: 2298,
        currency: "USD",
        card: {
          number: "4000000000000069",
          name: "Test User",
          cvc: "345",
          exp_month: "4",
          exp_year: "2019"
        }, capture: false
      }
    });
  });
});
