import PayFlow from "paypal-rest-sdk"; // PayFlow is PayPal PayFlow lib
import accounting from "accounting-js";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Reaction, Logger } from "/server/api";
import { Shops } from "/lib/collections";
import { PayPal } from "../../lib/api"; // PayPal is the reaction api

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment");
}

export const PayflowproApi = {};
PayflowproApi.apiCall = {};


PayflowproApi.apiCall.paymentSubmit = function (paymentSubmitDetails) {
  PayFlow.configure(PayPal.payflowAccountOptions());

  const paymentObj = PayPal.paymentObj();
  paymentObj.intent = paymentSubmitDetails.transactionType;
  paymentObj.payer.funding_instruments.push(PayPal.parseCardData(paymentSubmitDetails.cardData));
  paymentObj.transactions.push(PayPal.parsePaymentData(paymentSubmitDetails.paymentData));
  const wrappedFunc = Meteor.wrapAsync(PayFlow.payment.create, PayFlow.payment);
  let result;
  try {
    result = {
      saved: true,
      response: wrappedFunc(paymentObj)
    };
  } catch (error) {
    Logger.warn(error);
    result = {
      saved: false,
      error
    };
  }
  return result;
};


PayflowproApi.apiCall.captureCharge = function (paymentCaptureDetails) {
  PayFlow.configure(PayPal.payflowAccountOptions());

  let result;
  // TODO: This should be changed to some ReactionCore method
  const shop = Shops.findOne(Reaction.getShopId());
  const wrappedFunc = Meteor.wrapAsync(PayFlow.authorization.capture, PayFlow.authorization);
  const wrappedFuncVoid = Meteor.wrapAsync(PayFlow.authorization.void, PayFlow.authorization);
  const captureTotal = Math.round(parseFloat(paymentCaptureDetails.amount) * 100) / 100;
  const captureDetails = {
    amount: {
      currency: shop.currency,
      total: captureTotal
    },
    is_final_capture: true // eslint-disable-line camelcase
  };
  const capturedAmount = accounting.toFixed(captureDetails.amount.total, 2);

  if (capturedAmount === accounting.toFixed(0, 2)) {
    try {
      const response = wrappedFuncVoid(paymentCaptureDetails.authorizationId, captureDetails);

      result = {
        saved: true,
        metadata: {
          parentPaymentId: response.parent_payment,
          captureId: response.id
        },
        rawTransaction: response
      };
    } catch (error) {
      Logger.warn(error);
      result = {
        saved: false,
        error
      };
    }
    return result;
  }
  try {
    const response = wrappedFunc(paymentCaptureDetails.authorizationId, captureDetails);

    result = {
      saved: true,
      metadata: {
        parentPaymentId: response.parent_payment,
        captureId: response.id
      },
      rawTransaction: response
    };
  } catch (error) {
    Logger.warn(error);
    result = {
      saved: false,
      error
    };
  }
  return result;
};


PayflowproApi.apiCall.createRefund = function (refundDetails) {
  PayFlow.configure(PayPal.payflowAccountOptions());

  const createRefund = Meteor.wrapAsync(PayFlow.capture.refund, PayFlow.capture);
  let result;

  try {
    Logger.debug("payflowpro/refund/create: paymentMethod.metadata.captureId", refundDetails.captureId);
    const response = createRefund(refundDetails.captureId, {
      amount: {
        total: refundDetails.amount,
        currency: "USD"
      }
    });

    result = {
      saved: true,
      type: "refund",
      created: response.create_time,
      amount: response.amount.total,
      currency: response.amount.currency,
      rawTransaction: response
    };
  } catch (error) {
    result = {
      saved: false,
      error
    };
  }
  return result;
};


PayflowproApi.apiCall.listRefunds = function (refundListDetails) {
  PayFlow.configure(PayPal.payflowAccountOptions());

  const listPayments = Meteor.wrapAsync(PayFlow.payment.get, PayFlow.payment);
  let result = [];
  // todo: review parentPaymentId vs authorizationId, are they both correct?
  // added authorizationId without fully understanding the intent of parentPaymentId
  // let authId = paymentMethod.metadata.parentPaymentId || paymentMethod.metadata.authorizationId;
  const authId = refundListDetails.transactionId;

  if (authId) {
    Logger.debug("payflowpro/refund/list: paymentMethod.metadata.parentPaymentId", authId);
    try {
      const response = listPayments(authId);

      for (const transaction of response.transactions) {
        for (const resource of transaction.related_resources) {
          if (_.isObject(resource.refund)) {
            if (resource.refund.state === "completed") {
              Promise.await(lazyLoadMoment());
              result.push({
                type: "refund",
                created: moment(resource.refund.create_time).unix() * 1000,
                amount: Math.abs(resource.refund.amount.total),
                currency: resource.refund.amount.currency,
                raw: response
              });
            }
          }
        }
      }
    } catch (error) {
      Logger.warn("Failed payflowpro/refund/list", error);
      result = {
        error
      };
    }
  }
  return result;
};
