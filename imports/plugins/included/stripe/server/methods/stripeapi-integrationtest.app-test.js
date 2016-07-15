/* eslint camelcase: 0 */
// These Test are for use during development only. They require a StripeAPI and should not be run in CI
// They test whether the our StripeAPI methods work against the current Stripe gateway

import { expect } from "meteor/practicalmeteor:chai";
import { StripeApi } from "./stripeapi";

describe("StripeAPI createCharge function", function () {
  // Rigged like this because `this.skip()` doesn't seem to be implmented in meteor mocha
  // and best practice says skipped tests should be "pending" rather than success;
  if (!process.env.STRIPE_TEST_API_KEY) {
    it.skip("should return a result with status = success", function (done) {
      done();
    });
  } else {
    it("should return a result with status = success", function (done) {
      let apiKey = process.env.STRIPE_TEST_API_KEY;
      let cardObject = {
        number: "4242424242424242",
        name: "Test User",
        cvc: "345",
        exp_month: "02",
        exp_year: "2019"
      };
      let chargeObject = {
        amount: 1999,
        currency: "USD",
        card: cardObject,
        capture: false
      };

      StripeApi.methods.createCharge.validate({
        chargeObj: chargeObject,
        apiKey: apiKey
      });

      let result = StripeApi.methods.createCharge.run({ chargeObj: chargeObject, apiKey: apiKey });
      expect(result.status).to.equal("succeeded");
      done();
    });
  }
});

describe("StripeAPI createCustomer function", function () {
  // Rigged like this because `this.skip()` doesn't seem to be implmented in meteor mocha
  // and best practice says skipped tests should be "pending" rather than success;
  if (!process.env.STRIPE_TEST_API_KEY) {
    it.skip("should return a result with status = success", function (done) {
      done();
    });
  } else {
    it("should return a result with status = success", function (done) {
      let apiKey = process.env.STRIPE_TEST_API_KEY;
      let cardObject = {
        number: "4242424242424242",
        name: "Test User",
        cvc: "345",
        exp_month: "02",
        exp_year: "2019"
      };
      let chargeObject = {
        amount: 1999,
        currency: "USD",
        card: cardObject,
        capture: false
      };
      StripeApi.methods.createCustomer.validate({
        chargeObj: chargeObject,
        customerEmail: "example@example.com",
        apiKey: apiKey
      });

      let result = StripeApi.methods.createCustomer.run({
        chargeObj: chargeObject,
        customerEmail: "example@example.com",
        apiKey: apiKey
      });
      expect(result.object).to.equal("customer");
      done();
    }).timeout(5000);
  }
});


describe("StripeAPI captureCharge function", function () {
  if (!process.env.STRIPE_TEST_API_KEY) {
    it.skip("should return a result with status = success", function (done) {
      done();
    });
  } else {
    it("should return a result with status = success", function (done) {
      let apiKey = process.env.STRIPE_TEST_API_KEY;
      let cardObject = {
        number: "4242424242424242",
        name: "Test User",
        cvc: "345",
        exp_month: "02",
        exp_year: "2019"
      };
      let chargeObject = {
        amount: 1999,
        currency: "USD",
        card: cardObject,
        capture: false
      };
      const chargeResult = StripeApi.methods.createCharge.run({ chargeObj: chargeObject, apiKey: apiKey });
      const transactionId = chargeResult.id;
      const captureDetails = {
        amount: 1999
      };
      let result = StripeApi.methods.captureCharge.call({
        transactionId: transactionId,
        captureDetails: captureDetails,
        apiKey: apiKey
      });
      expect(result.status).to.equal("succeeded");
      done();
    });
  }
});

describe("StripeAPI createRefund function", function () {
  if (!process.env.STRIPE_TEST_API_KEY) {
    it.skip("should return a result with object = refund", function (done) {
      done();
    });
  } else {
    it("should return a result with object = refund", function (done) {
      let apiKey = process.env.STRIPE_TEST_API_KEY;
      let cardObject = {
        number: "4242424242424242",
        name: "Test User",
        cvc: "345",
        exp_month: "02",
        exp_year: "2019"
      };
      let chargeObject = {
        amount: 1999,
        currency: "USD",
        card: cardObject,
        capture: true
      };

      const chargeResult = StripeApi.methods.createCharge.call({ chargeObj: chargeObject, apiKey: apiKey });
      let refundDetails = {
        charge: chargeResult.id,
        amount: 1999,
        reason: "requested_by_customer"
      };
      const refundResult = StripeApi.methods.createRefund.call({
        refundDetails: refundDetails,
        apiKey: apiKey
      });

      expect(refundResult.object).to.equal("refund");
      done();
    }).timeout(5000);
  }
});

describe("StripeAPI listRefund function", function () {
  if (!process.env.STRIPE_TEST_API_KEY) {
    it.skip("should return a list of refunds", function (done) {
      done();
    });
  } else {
    it("should return a list of refunds", function (done) {
      let apiKey = process.env.STRIPE_TEST_API_KEY;
      let cardObject = {
        number: "4242424242424242",
        name: "Test User",
        cvc: "345",
        exp_month: "02",
        exp_year: "2019"
      };
      let chargeObject = {
        amount: 1999,
        currency: "USD",
        card: cardObject,
        capture: true
      };

      const chargeResult = StripeApi.methods.createCharge.call({ chargeObj: chargeObject, apiKey: apiKey });
      let refundDetails = {
        charge: chargeResult.id,
        amount: 1999,
        reason: "requested_by_customer"
      };
      const refundResult = StripeApi.methods.createRefund.call({
        refundDetails: refundDetails,
        apiKey: apiKey
      });

      expect(refundResult.object).to.equal("refund");
      const refundList = StripeApi.methods.listRefunds.call({
        transactionId: chargeResult.id,
        apiKey: apiKey
      });
      expect(refundList.object).to.equal("list");
      const firstRefund = refundList.data[0];
      expect(firstRefund.object).to.equal("refund");
      done();
    }, 10000);
  }
});
