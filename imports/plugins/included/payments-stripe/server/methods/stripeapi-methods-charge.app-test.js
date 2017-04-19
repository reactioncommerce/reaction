/* eslint camelcase: 0 */
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { StripeApi } from "./stripeapi";
import { Stripe } from "../../lib/api";

const stripeChargeResult = {
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


describe("Stripe.authorize", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call StripeApi.methods.createCharge with the proper parameters and return saved = true", function (done) {
    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeChargeResult;
    });
    const cardData = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4242424242424242",
      type: "visa"
    };
    const total = "22.98";
    const currency = "USD";
    let chargeResult = null;
    Stripe.authorize(cardData, { total: total, currency: currency }, function (error, result) {
      chargeResult = result;
      expect(chargeResult).to.not.be.undefined;
      expect(chargeResult.saved).to.be.true;
      done();
    });
  });
});

describe("Stripe.authorize", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should properly charge a card when using a currency besides USD", function (done) {
    const form = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4242424242424242",
      type: "visa"
    };
    const total = "22.98";
    const currency = "EUR";

    sandbox.stub(StripeApi.methods.createCharge, "call", function () {
      return stripeChargeResult;
    });
    // spyOn(StripeApi.methods.createCharge, "call").and.returnValue(stripeChargeResult);
    let chargeResult = null;
    Stripe.authorize(form, { total: total, currency: currency }, function (error, result) {
      chargeResult = result;
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
      done();
    });
  });
});

describe("Stripe.authorize", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should return saved = false when card is declined", function (done) {
    const form = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4000000000000002",
      type: "visa"
    };
    const total = "22.98";
    const currency = "EUR";

    const stripeDeclineResult =
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
    // spyOn(StripeApi.methods.createCharge, "call").and.returnValue(stripeDeclineResult);

    let chargeResult = null;
    Stripe.authorize(form, { total: total, currency: currency }, function (error, result) {
      chargeResult = result;

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
      done();
    });
  });
});

describe("Stripe.authorize", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should return saved = false when an expired card is returned", function (done) {
    // Note that this test number makes the Stripe API return this error, it is
    // not looking at the actual expiration date.
    const form = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2019",
      name: "Test User",
      number: "4000000000000069",
      type: "visa"
    };
    const total = "22.98";
    const currency = "USD";

    const stripeExpiredCardResult =
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
    Stripe.authorize(form, { total: total, currency: currency }, function (error, result) {
      chargeResult = result;
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
      done();
    });
  });
});
