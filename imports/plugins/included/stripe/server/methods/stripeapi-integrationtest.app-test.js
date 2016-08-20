/* eslint camelcase: 0 */
// These Test are for use during development only. They require a StripeAPI and should not be run in CI
// They test whether the our StripeAPI methods work against the current Stripe gateway

import { expect } from "meteor/practicalmeteor:chai";
import { StripeApi } from "./stripeapi";

describe.skip("StripeAPI createCharge function", function () {
  it("should return a result with status = success", function (done) {
    const apiKey = "";
    const cardObject = {
      number: "4242424242424242",
      name: "Test User",
      cvc: "345",
      exp_month: "02",
      exp_year: "2019"
    };
    const chargeObject = {
      amount: 1999,
      currency: "USD",
      card: cardObject,
      capture: false
    };

    StripeApi.methods.createCharge.validate({
      chargeObj: chargeObject,
      apiKey: apiKey
    });

    const result = StripeApi.methods.createCharge.run({ chargeObj: chargeObject, apiKey: apiKey });
    expect(result.status).to.equal("succeeded");
    done();
  });
});

describe.skip("StripeAPI captureCharge function", function () {
  it("should return a result with status = success", function (done) {
    const apiKey = "";
    const cardObject = {
      number: "4242424242424242",
      name: "Test User",
      cvc: "345",
      exp_month: "02",
      exp_year: "2019"
    };
    const chargeObject = {
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
    const result = StripeApi.methods.captureCharge.call({
      transactionId: transactionId,
      captureDetails: captureDetails,
      apiKey: apiKey
    });
    expect(result.status).toBe("succeeded");
    done();
  });
});

describe.skip("StripeAPI createRefund function", function () {
  it("should return a result with object = refund", function (done) {
    const apiKey = "";
    const cardObject = {
      number: "4242424242424242",
      name: "Test User",
      cvc: "345",
      exp_month: "02",
      exp_year: "2019"
    };
    const chargeObject = {
      amount: 1999,
      currency: "USD",
      card: cardObject,
      capture: true
    };

    const chargeResult = StripeApi.methods.createCharge.call({ chargeObj: chargeObject, apiKey: apiKey });
    const refundDetails = {
      charge: chargeResult.id,
      amount: 1999,
      reason: "requested_by_customer"
    };
    const refundResult = StripeApi.methods.createRefund.call({
      refundDetails: refundDetails,
      apiKey: apiKey
    });

    expect(refundResult.object).toBe("refund");
    done();
  });
});

describe.skip("StripeAPI listRefund function", function () {
  it("should return a list of refunds", function (done) {
    const apiKey = "";
    const cardObject = {
      number: "4242424242424242",
      name: "Test User",
      cvc: "345",
      exp_month: "02",
      exp_year: "2019"
    };
    const chargeObject = {
      amount: 1999,
      currency: "USD",
      card: cardObject,
      capture: true
    };

    const chargeResult = StripeApi.methods.createCharge.call({ chargeObj: chargeObject, apiKey: apiKey });
    const refundDetails = {
      charge: chargeResult.id,
      amount: 1999,
      reason: "requested_by_customer"
    };
    const refundResult = StripeApi.methods.createRefund.call({
      refundDetails: refundDetails,
      apiKey: apiKey
    });

    expect(refundResult.object).toBe("refund");
    const refundList = StripeApi.methods.listRefunds.call({
      transactionId: chargeResult.id,
      apiKey: apiKey
    });
    expect(refundList.object).toBe("list");
    const firstRefund = refundList.data[0];
    expect(firstRefund.object).toBe("refund");
    done();
  }, 10000);
});

