/* eslint camelcase: 0 */
/* eslint prefer-arrow-callback:0 */
import nock from "nock";
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { utils } from "./stripe";

describe("stripe/refunds/list", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should call StripeApi.methods.listRefunds with the proper parameters and return a properly" +
    "formatted list of refunds", function (done) {
    const paymentMethod = {
      processor: "Stripe",
      storedCard: "Visa 4242",
      paymentPackageId: "vrXutd72c2m7Lenqw",
      paymentSettingsKey: "reaction-stripe",
      method: "credit",
      transactionId: "ch_17iCSlBXXkbZQs3xUpRw24mL",
      amount: 19.99,
      status: "completed",
      mode: "capture",
      createdAt: new Date(),
      workflow: {
        status: "new"
      },
      metadata: {}
    };

    const stripeRefundListResult = {
      object: "list",
      data: [
        {
          id: "re_17iCTeBXXkbZQs3xYZ3iJyB6",
          object: "refund",
          amount: 1999,
          balance_transaction: "txn_17iCTeBXXkbZQs3xl9FKE5an",
          charge: "ch_17iCSlBXXkbZQs3xUpRw24mL",
          created: 1456358130,
          currency: "usd",
          metadata: {},
          reason: null,
          receipt_number: null
        }
      ],
      has_more: false,
      url: "/v1/refunds"
    };

    // Stripe Charge Nock
    nock("https://api.stripe.com:443")
      .get("/v1/refunds")
      .reply(200, stripeRefundListResult); // .log(console.log);

    sandbox.stub(utils, "getStripeApi", function () {
      return "sk_fake_fake";
    });

    let refundListResult = null;
    let refundListError = null;
    Meteor.call("stripe/refund/list", paymentMethod, function (error, result) {
      refundListResult = result;
      refundListError = error;
      expect(refundListError).to.be.undefined;
      expect(refundListResult).to.not.be.undefined;
      expect(refundListResult.length).to.equal(1);
      expect(refundListResult[0].type).to.equal("refund");
      expect(refundListResult[0].amount).to.equal(19.99);
      expect(refundListResult[0].currency).to.equal("usd");
      done();
    });
  });
});

