/* eslint camelcase: 0 */
/* eslint prefer-arrow-callback:0 */
import nock from "nock";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Cart } from "/lib/collections";
import { methods } from "./stripe.js";

// Testing stripe using the npm Nock lib available here:
// NPM: https://www.npmjs.com/package/nock
// Docs / Github: https://github.com/node-nock/nock

// The nock package permits mocking of HTTP calls and responses.
// Sinon struggles to mock the stripe node package well, this does a much
// better job.
//
// To extend or add additional tests, it's best to run
// nock.recorder.rec();
// in your test and view the output. This will give you a basic nock structure
// that you can copy as the exact url and params are somewhat obscured by
// the stripe lib
//
// You can also append .log(console.log) to your nock chain to see which
// of your nocks are handling correctly.
//
// I'm leaving the commented `.log`s below as an example for how to build
// nock http mocks.
//
// This Stack Overflow answer was helpful to me when I was getting started with nock.
// https://stackoverflow.com/questions/22645216/stubbing-stripe-with-sinon-using-stub-yields/22662511#22662511

// Disable any HTTP connection during test
// nock.disableNetConnect();

const validCardToken = {
  id: "tok_visa",
  card: {
    brand: "Visa",
    last4: "4242"
  }
};

const testStripePkg = {
  _id: "dLubvXeAciAY3ECD9",
  name: "reaction-stripe",
  shopId: "DFzmTo27eFS97tfSW",
  enabled: true,
  settings: {
    "mode": false,
    "api_key": "sk_test_testkey",
    "reaction-stripe": {
      enabled: false,
      support: [
        "Authorize",
        "Capture",
        "Refund"
      ]
    },
    "public": {
      client_id: "ca_testclientid",
      publishable_key: "pk_test_testkey"
    },
    "connectAuth": {
      stripe_user_id: "ca_testconnectid"
    },
    "client_id": "ca_testclientid",
    "applicationFee": 1
  }
};

const stripeCustomerResponse = {
  id: "cus_testcust",
  object: "customer",
  account_balance: 0,
  created: 1503200959,
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
    url: "/v1/customers/cus_testcust/sources"
  },
  subscriptions: {
    object: "list",
    data: [],
    has_more: false,
    total_count: 0,
    url: "/v1/customers/cus_testcust/subscriptions"
  }
};

const stripeCustomerResponseWithSource = {
  id: "card_testcard",
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
  customer: "cus_testcust",
  cvc_check: "pass",
  dynamic_last4: null,
  exp_month: 4,
  exp_year: 2019,
  fingerprint: "0tSZC0FAG4yYkbXM",
  funding: "credit",
  last4: "4242",
  metadata: {},
  name: "Test User",
  tokenization_method: null
};

const stripeConnectCustomerResponseWithSource = {
  id: "tok_connectcustomertesttoken",
  object: "token",
  card: {
    id: "card_testcard",
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
    currency: "usd",
    cvc_check: null,
    dynamic_last4: null,
    exp_month: 6,
    exp_year: 2019,
    fingerprint: "Ww6hVrEkGlVMYukm",
    funding: "credit",
    last4: "4242",
    metadata: {},
    name: null,
    tokenization_method: null
  },
  client_ip: "0.0.0.0",
  created: 1530169069,
  livemode: false,
  type: "card",
  used: false
};

const stripeChargeResult = {
  id: "ch_testcharge",
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


describe("stripe/payment/createCharges", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    nock.cleanAll();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should create a charge with valid api key and card token", function (done) {
    this.timeout(10000);
    const cart = Factory.create("cartToOrder");

    Factory.create("account", {
      _id: cart.userId,
      emails: [{ address: "test@example.com" }]
    });

    sandbox.stub(Reaction, "getPrimaryShopId", function () {
      return cart.shopId;
    });

    sandbox.stub(Reaction, "getPackageSettingsWithOptions", function () {
      return testStripePkg;
    });

    // create a charge result object that has the cart total in stripe format (cents)
    const chargeResult = Object.assign({}, stripeChargeResult, { amount: cart.getTotal() * 100 });

    // Stripe Create Customer Nock
    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/customers", "email=test%40example.com")
      .reply(200, stripeCustomerResponse); // .log(console.log);

    // Stripe Add Source To Customer Nock
    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post(`/v1/customers/${stripeCustomerResponse.id}/sources`, `source=${validCardToken.id}`)
      .reply(200, stripeCustomerResponseWithSource); // .log(console.log);

    // Stripe Charge Nock
    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/charges", `amount=${cart.getTotal() * 100}&capture=false&currency=USD&customer=${stripeCustomerResponse.id}`)
      .reply(200, chargeResult); // .log(console.log);

    methods["stripe/payment/createCharges"]("authorize", validCardToken, cart._id)
      .then((res) => {
        const transactionIds = Object.keys(res.transactions);
        const txId = transactionIds[0];
        expect(res.success).to.equal(true);
        expect(res.transactions[txId].amount).to.equal(cart.getTotal() * 100);
        return null;
      })
      .then(() => done())
      .catch(done);
  });
});

describe("stripe/payment/createCharges", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    nock.cleanAll();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should throw an error with an invalid api key", function (done) {
    this.timeout(10000);
    const cart = Factory.create("cartToOrder");

    Factory.create("account", {
      _id: cart.userId,
      emails: [{ address: "test@example.com" }]
    });

    sandbox.stub(Reaction, "getPrimaryShopId", function () {
      return cart.shopId;
    });

    sandbox.stub(Reaction, "getPackageSettingsWithOptions", function () {
      return testStripePkg;
    });

    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/customers", "email=test%40example.com")
      .reply(401, {
        error: {
          message: "Invalid API Key provided: sk_test_***tkey",
          type: "invalid_request_error"
        }
      });

    expect(function () {
      Meteor.call("stripe/payment/createCharges", "authorize", validCardToken, cart._id);
    }).to.throw();
    return done();
  });
});

describe("stripe/payment/createCharges", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    nock.cleanAll();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should be able to create multiple charges", function (done) {
    this.timeout(10000);
    let cart = Factory.create("cartMultiShop");
    // Assign shipping for the second shop
    Meteor.call("shipping/updateShipmentQuotes", cart._id);
    // Reload cart to fetch the shipping costs updated from the shipping/updateShipmentQuotes
    cart = Cart.findOne({ _id: cart._id });

    Factory.create("account", {
      _id: cart.userId,
      emails: [{ address: "test@example.com" }]
    });

    sandbox.stub(Reaction, "getPrimaryShopId", function () {
      return cart.shopId;
    });

    sandbox.stub(Reaction, "getPackageSettingsWithOptions", function () {
      return testStripePkg;
    });

    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/customers", "email=test%40example.com")
      .reply(200, stripeCustomerResponse); // .log(console.log);

    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post(`/v1/customers/${stripeCustomerResponse.id}/sources`, `source=${validCardToken.id}`)
      .reply(200, stripeCustomerResponseWithSource); // .log(console.log);

    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/tokens", `customer=${stripeCustomerResponse.id}`)
      .reply(200, stripeConnectCustomerResponseWithSource); // .log(console.log);

    const shopIds = cart.items.reduce((uniqueShopIds, item) => {
      if (uniqueShopIds.indexOf(item.shopId) === -1) {
        uniqueShopIds.push(item.shopId);
      }
      return uniqueShopIds;
    }, []);

    const cartTotals = cart.getTotalByShop();
    const cartSubtotals = cart.getSubtotalByShop();
    shopIds.forEach((shopId) => {
      // Create package per shop as it will be required in buildPaymentMethods
      let params = `amount=${cartTotals[shopId] * 100}&capture=false&currency=USD&customer=${stripeCustomerResponse.id}`;
      if (shopId !== cart.shopId) {
        const extraStripePkg = Object.assign({}, testStripePkg, { _id: Random.id(), shopId });
        const applicationFee = cartSubtotals[shopId] * extraStripePkg.settings.applicationFee;
        params = `amount=${cartTotals[shopId] * 100}&capture=false&currency=USD`
          + `&source=${stripeConnectCustomerResponseWithSource.id}&application_fee=${applicationFee}`;
        Factory.create("examplePackage", extraStripePkg);
      }

      const chargeResult = Object.assign({}, stripeChargeResult, { amount: cartTotals[shopId] * 100 });

      nock("https://api.stripe.com:443", { encodedQueryParams: true })
        .post("/v1/charges", params)
        .reply(200, chargeResult); // .log(console.log);
    });

    methods["stripe/payment/createCharges"]("authorize", validCardToken, cart._id)
      .then((res) => {
        expect(res.success).to.equal(true);
        const transactionIds = Object.keys(res.transactions);
        for (const txId of transactionIds) {
          expect(res.transactions[txId].amount).to.equal(cartTotals[txId] * 100);
        }
        return null;
      })
      .then(() => done())
      .catch(done);
  });
});
