/* eslint camelcase: 0 */
/* eslint prefer-arrow-callback:0 */
import nock from "nock";

import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import { check, Match } from "meteor/check";

import { Reaction } from "/server/api";
import { methods } from "./stripe.js";


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
      client_id: ""
    },
    "connectAuth": {
      stripe_user_id: "ca_testconnectid"
    },
    "client_id": "ca_testclientid"
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

// We'll need this when we test multiple charges
// const stripeTokenResponse = {
//   id: "tok_1AskR8BXXkbZQs3xdsjQ9Fmp",
//   object: "token",
//   card: {
//     id: "card_1AskR8BXXkbZQs3xpeBlqTiF",
//     object: "card",
//     address_city: null,
//     address_country: null,
//     address_line1: null,
//     address_line1_check: null,
//     address_line2: null,
//     address_state: null,
//     address_zip: null,
//     address_zip_check: null,
//     brand: "Visa",
//     country: "US",
//     cvc_check: null,
//     dynamic_last4: null,
//     exp_month: 8,
//     exp_year: 2018,
//     fingerprint: "sMf9T3BK8Si2Nqme",
//     funding: "credit",
//     last4: "4242",
//     metadata: {
//     },
//     name: null,
//     tokenization_method: null
//   },
//   client_ip: null,
//   created: 1503200958,
//   livemode: false,
//   type: "card",
//   used: false
// };

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
    // See below for deeper description of the nock lib used here.
    // This method cleans up nocks that might have failed for any reason.
    nock.cleanAll();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call stripe/payment/createCharges with the proper parameters and create an order", function (done) {
    this.timeout(10000);
    // This is a pretty full payment => order integration test currently.
    // This test should probably be split into multiple parts
    // Each part should probably isolate downstream methods that get called
    // such as copyCartToOrder, etc
    const cart = Factory.create("cartToOrder");
    Factory.create("account", {
      _id: cart.userId,
      emails: [{ address: "test@example.com" }]
    });

    // Set Meteor userId to the cart userId
    sandbox.stub(Meteor, "userId", function () {
      return cart.userId;
    });

    sandbox.stub(Meteor.server.method_handlers, "cart/createCart", function (...args) {
      check(args, [Match.Any]);
    });

    sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
      check(args, [Match.Any]);
    });

    // This stub causes the the charge to go through as the primary shop charge
    // and skip the application_fee and customer tokenization that is required
    // for charging multiple shops
    sandbox.stub(Reaction, "getPrimaryShopId", function () {
      return cart.shopId;
    });

    sandbox.stub(Reaction, "getPackageSettingsWithOptions", function () {
      return testStripePkg;
    });

    const cardData = {
      cvv2: "345",
      expire_month: "4",
      expire_year: "2022",
      name: "Test User",
      number: "4242424242424242",
      type: "visa"
    };

    // create a charge result object that has the cart total in stripe format (cents)
    const chargeResult = Object.assign({}, stripeChargeResult, { amount: cart.getTotal() * 100 });

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

    // Stripe Create Customer Nock
    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/customers", "email=test%40example.com")
      .reply(200, stripeCustomerResponse); // .log(console.log);

    // Card data for adding a card source to a customer
    const number = "source%5Bnumber%5D=4242424242424242";
    const name = "source%5Bname%5D=Test%20User";
    const cvc = "source%5Bcvc%5D=345";
    const expiry = "source%5Bexp_month%5D=4&source%5Bexp_year%5D=2022";
    const source = "source%5Bobject%5D=card";

    // Stripe Add Source To Customer Nock
    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post(`/v1/customers/${stripeCustomerResponse.id}/sources`, `${number}&${name}&${cvc}&${expiry}&${source}`)
      .reply(200, stripeCustomerResponseWithSource); // .log(console.log);

    // If we were testing a multi-shop order, we'd need to nock the tokens API
    // and update our /v1/charges nock to use a source (token) instead of the
    // customer=customerId as used in the charge nock below
    // Stripe Token Nock
    // nock("https://api.stripe.com:443", { encodedQueryParams: true })
    //   .post("/v1/tokens", `customer=${stripeCustomerResponse.id}`)
    //   .reply(200, chargeResult).log(console.log);

    // Stripe Charge Nock
    nock("https://api.stripe.com:443", { encodedQueryParams: true })
      .post("/v1/charges", `amount=${cart.getTotal() * 100}&capture=false&currency=USD&customer=${stripeCustomerResponse.id}`)
      .reply(200, chargeResult); // .log(console.log);

    methods["stripe/payment/createCharges"]("authorize", cardData, cart._id).then((res) => {
      const transactionIds = Object.keys(res.transactions);
      const txId = transactionIds[0];
      expect(res.success).to.equal(true);
      expect(res.transactions[txId].amount).to.equal(cart.getTotal() * 100);
    }).then(() => done(), done);
  });
});


// TODO: Rebuild the tests below for the new Stripe integration
// describe("Stripe.authorize", function () {
//   let sandbox;
//
//   beforeEach(function () {
//     sandbox = sinon.sandbox.create();
//   });
//
//   afterEach(function () {
//     sandbox.restore();
//   });
//
//   it("should properly charge a card when using a currency besides USD", function (done) {
//     const form = {
//       cvv2: "345",
//       expire_month: "4",
//       expire_year: "2019",
//       name: "Test User",
//       number: "4242424242424242",
//       type: "visa"
//     };
//     const total = "22.98";
//     const currency = "EUR";
//
//     sandbox.stub(StripeApi.methods.createCharge, "call", function () {
//       return stripeChargeResult;
//     });
//     // spyOn(StripeApi.methods.createCharge, "call").and.returnValue(stripeChargeResult);
//     let chargeResult = null;
//     Stripe.authorize(form, { total: total, currency: currency }, function (error, result) {
//       chargeResult = result;
//       expect(chargeResult).to.not.be.undefined;
//       expect(chargeResult.saved).to.be.true;
//       expect(StripeApi.methods.createCharge.call).to.have.been.calledWith({
//         chargeObj: {
//           amount: 2298,
//           currency: "EUR",
//           card: {
//             number: "4242424242424242",
//             name: "Test User",
//             cvc: "345",
//             exp_month: "4",
//             exp_year: "2019"
//           }, capture: false
//         }
//       });
//       done();
//     });
//   });
// });
//
// describe("Stripe.authorize", function () {
//   let sandbox;
//
//   beforeEach(function () {
//     sandbox = sinon.sandbox.create();
//   });
//
//   afterEach(function () {
//     sandbox.restore();
//   });
//
//   it("should return saved = false when card is declined", function (done) {
//     const form = {
//       cvv2: "345",
//       expire_month: "4",
//       expire_year: "2019",
//       name: "Test User",
//       number: "4000000000000002",
//       type: "visa"
//     };
//     const total = "22.98";
//     const currency = "EUR";
//
//     const stripeDeclineResult =
//       {
//         result: null,
//         error: {
//           type: "StripeCardError",
//           rawType: "card_error",
//           code: "card_declined",
//           param: undefined,
//           message: "Your card was declined.",
//           detail: undefined,
//           raw: {
//             message: "Your card was declined.",
//             type: "card_error",
//             code: "card_declined",
//             charge: "ch_17hXeXBXXkbZQs3x3lpNoH9l",
//             statusCode: 402,
//             requestId: "req_7xSZItk9XdVUIJ"
//           },
//           requestId: "req_7xSZItk9XdVUIJ",
//           statusCode: 402
//         }
//       };
//     sandbox.stub(StripeApi.methods.createCharge, "call", function () {
//       return stripeDeclineResult;
//     });
//     // spyOn(StripeApi.methods.createCharge, "call").and.returnValue(stripeDeclineResult);
//
//     let chargeResult = null;
//     Stripe.authorize(form, { total: total, currency: currency }, function (error, result) {
//       chargeResult = result;
//
//       expect(chargeResult).to.not.be.undefined;
//       expect(chargeResult.saved).to.be.false;
//       expect(chargeResult.error.message).to.equal("Your card was declined.");
//       expect(StripeApi.methods.createCharge.call).to.have.been.calledWith({
//         chargeObj: {
//           amount: 2298,
//           currency: "EUR",
//           card: {
//             number: "4000000000000002",
//             name: "Test User",
//             cvc: "345",
//             exp_month: "4",
//             exp_year: "2019"
//           }, capture: false
//         }
//       });
//       done();
//     });
//   });
// });
//
// describe("Stripe.authorize", function () {
//   let sandbox;
//
//   beforeEach(function () {
//     sandbox = sinon.sandbox.create();
//   });
//
//   afterEach(function () {
//     sandbox.restore();
//   });
//
//   it("should return saved = false when an expired card is returned", function (done) {
//     // Note that this test number makes the Stripe API return this error, it is
//     // not looking at the actual expiration date.
//     const form = {
//       cvv2: "345",
//       expire_month: "4",
//       expire_year: "2019",
//       name: "Test User",
//       number: "4000000000000069",
//       type: "visa"
//     };
//     const total = "22.98";
//     const currency = "USD";
//
//     const stripeExpiredCardResult =
//       {
//         result: null,
//         error: {
//           type: "StripeCardError",
//           rawType: "card_error",
//           code: "expired_card",
//           param: "exp_month",
//           message: "Your card has expired.",
//           raw: {
//             message: "Your card has expired.",
//             type: "card_error",
//             param: "exp_month",
//             code: "expired_card",
//             charge: "ch_17iBsDBXXkbZQs3xfZArVPEd",
//             statusCode: 402,
//             requestId: "req_7y88CojR2UJYOd"
//           },
//           requestId: "req_7y88CojR2UJYOd",
//           statusCode: 402
//         }
//       };
//     sandbox.stub(StripeApi.methods.createCharge, "call", function () {
//       return stripeExpiredCardResult;
//     });
//
//     let chargeResult = null;
//     Stripe.authorize(form, { total: total, currency: currency }, function (error, result) {
//       chargeResult = result;
//       expect(chargeResult).to.not.be.undefined;
//       expect(chargeResult.saved).to.be.false;
//       expect(chargeResult.error.message).to.equal("Your card has expired.");
//       expect(StripeApi.methods.createCharge.call).to.have.been.calledWith({
//         chargeObj: {
//           amount: 2298,
//           currency: "USD",
//           card: {
//             number: "4000000000000069",
//             name: "Test User",
//             cvc: "345",
//             exp_month: "4",
//             exp_year: "2019"
//           }, capture: false
//         }
//       });
//       done();
//     });
//   });
// });
