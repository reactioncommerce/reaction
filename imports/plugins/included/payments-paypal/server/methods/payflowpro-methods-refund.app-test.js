/* eslint camelcase: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { PayflowproApi } from "./payflowproApi";

describe("payflowpro/refund/create", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Should call payflowpro/refund/create with the proper parameters and return saved = true", function (done) {
    const paymentMethod = {
      processor: "PayflowPro",
      storedCard: "Visa 0322",
      method: "credit",
      paymentPackageId: "vrXutd72c2m7Lenqw",
      paymentSettingsKey: "payflow",
      authorization: "17E47122C3842243W",
      transactionId: "PAY-2M9650078C535230RK6YVLQY",
      metadata: {
        transactionId: "PAY-2M9650078C535230RK6YVLQY",
        authorizationId: "17E47122C3842243W",
        parentPaymentId: "PAY-2M9650078C535230RK6YVLQY",
        captureId: "4F639165YD1630705"
      },
      amount: 74.93,
      status: "completed",
      mode: "capture",
      createdAt: new Date(),
      updatedAt: new Date(),
      workflow: {
        status: "new"
      }
    };


    const payflowproRefundResult = {
      saved: true,
      type: "refund",
      created: "2016-08-15T05:58:14Z",
      amount: "2.47",
      currency: "USD",
      rawTransaction: {
        id: "23546021UW746214P",
        create_time: "2016-08-15T05:58:14Z",
        update_time: "2016-08-15T05:58:14Z",
        state: "completed",
        amount: {
          total: "2.47",
          currency: "USD"
        },
        capture_id: "4F639165YD1630705",
        parent_payment: "PAY-2M9650078C535230RK6YVLQY",
        links: [{
          href: "https://api.sandbox.paypal.com/v1/payments/refund/23546021UW746214P",
          rel: "self",
          method: "GET"
        }, {
          href: "https://api.sandbox.paypal.com/v1/payments/payment/PAY-2M9650078C535230RK6YVLQY",
          rel: "parent_payment",
          method: "GET"
        }, {
          href: "https://api.sandbox.paypal.com/v1/payments/capture/4F639165YD1630705",
          rel: "capture",
          method: "GET"
        }],
        httpStatusCode: 201
      }
    };


    sandbox.stub(PayflowproApi.apiCall, "createRefund", function () {
      return payflowproRefundResult;
    });
    let refundResult = null;
    let refundError = null;
    Meteor.call("payflowpro/refund/create", paymentMethod, paymentMethod.amount, function (error, result) {
      refundResult = result;
      refundError = error;
      expect(refundError).to.be.undefined;
      expect(refundResult).to.not.be.undefined;
      expect(refundResult.saved).to.be.true;
      done();
    });
  });
});
