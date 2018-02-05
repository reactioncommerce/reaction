/* eslint camelcase: 0 */
/* eslint prefer-arrow-callback:0 */
import nock from "nock";
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { utils } from "./stripe";

describe("stripe/refund/create", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call StripeApi.methods.createRefund with the proper parameters and return saved = true", function (done) {
    const paymentMethod = {
      processor: "Stripe",
      storedCard: "Visa 4242",
      paymentPackageId: "vrXutd72c2m7Lenqw",
      paymentSettingsKey: "reaction-stripe",
      method: "credit",
      transactionId: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
      amount: 19.99,
      status: "completed",
      mode: "capture",
      createdAt: new Date(),
      workflow: { status: "new" },
      metadata: {}
    };

    const stripeRefundResult = {
      id: "re_17hZzSBXXkbZQs3xgmmEeOci",
      object: "refund",
      amount: 1999,
      balance_transaction: "txn_17hZzSBXXkbZQs3xr6d9YECZ",
      charge: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
      created: 1456210186,
      currency: "usd",
      metadata: {},
      reason: null,
      receipt_number: null
    };

    // Stripe Charge Nock
    nock("https://api.stripe.com:443")
      .post("/v1/refunds")
      .reply(200, stripeRefundResult); // .log(console.log);

    sandbox.stub(utils, "getStripeApi", function () {
      return "sk_fake_fake";
    });

    let refundResult = null;
    let refundError = null;
    Meteor.call("stripe/refund/create", paymentMethod, paymentMethod.amount, function (error, result) {
      refundResult = result;
      refundError = error;
      expect(refundError).to.be.undefined;
      expect(refundResult).to.not.be.undefined;
      expect(refundResult.saved).to.be.true;
      done();
    });
  });
});

