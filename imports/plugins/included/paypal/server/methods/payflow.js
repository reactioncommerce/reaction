import PayFlow from "paypal-rest-sdk"; // PayFlow is PayPal PayFlow lib
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Shops } from "/lib/collections";
import { Paypal } from "../../lib/api"; // Paypal is the reaction api

Meteor.methods({
  /**
   * payflowpro/payment/submit
   * Create and Submit a PayPal PayFlow transaction
   * @param  {Object} transactionType transactionType
   * @param  {Object} cardData cardData object
   * @param  {Object} paymentData paymentData object
   * @return {Object} results from PayPal payment create
   */
  "payflowpro/payment/submit": function (transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, Object);
    check(paymentData, Object);
    this.unblock();

    PayFlow.configure(Paypal.payflowAccountOptions());

    let paymentObj = Paypal.paymentObj();
    paymentObj.intent = transactionType;
    paymentObj.payer.funding_instruments.push(Paypal.parseCardData(cardData));
    paymentObj.transactions.push(Paypal.parsePaymentData(paymentData));
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
        error: error
      };
    }
    return result;
  },


  /**
   * payflowpro/payment/capture
   * Capture an authorized PayPal transaction
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {Object} results from PayPal normalized
   */
  "payflowpro/payment/capture": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    this.unblock();

    PayFlow.configure(Paypal.payflowAccountOptions());

    let result;
    // TODO: This should be changed to some ReactionCore method
    const shop = Shops.findOne(Reaction.getShopId());
    const wrappedFunc = Meteor.wrapAsync(PayFlow.authorization.capture, PayFlow.authorization);
    let captureTotal = Math.round(parseFloat(paymentMethod.amount) * 100) / 100;
    const captureDetails = {
      amount: {
        currency: shop.currency,
        total: captureTotal
      },
      is_final_capture: true // eslint-disable-line camelcase
    };

    try {
      const response = wrappedFunc(paymentMethod.metadata.authorizationId, captureDetails);

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
        error: error
      };
    }
    return result;
  },

  "payflowpro/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    this.unblock();

    PayFlow.configure(Paypal.payflowAccountOptions());

    let createRefund = Meteor.wrapAsync(PayFlow.capture.refund, PayFlow.capture);
    let result;

    try {
      Logger.debug("payflowpro/refund/create: paymentMethod.metadata.captureId", paymentMethod.metadata.captureId);
      let response = createRefund(paymentMethod.metadata.captureId, {
        amount: {
          total: amount,
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
        error: error
      };
    }
    return result;
  },

  "payflowpro/refund/list": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    this.unblock();

    PayFlow.configure(Paypal.payflowAccountOptions());

    let listPayments = Meteor.wrapAsync(PayFlow.payment.get, PayFlow.payment);
    let result = [];
    // todo: review parentPaymentId vs authorizationId, are they both correct?
    // added authorizationId without fully understanding the intent of parentPaymentId
    // let authId = paymentMethod.metadata.parentPaymentId || paymentMethod.metadata.authorizationId;
    let authId = paymentMethod.metadata.transactionId;

    if (authId) {
      Logger.debug("payflowpro/refund/list: paymentMethod.metadata.parentPaymentId", authId);
      try {
        let response = listPayments(authId);

        for (let transaction of response.transactions) {
          for (let resource of transaction.related_resources) {
            if (_.isObject(resource.refund)) {
              if (resource.refund.state === "completed") {
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
          error: error
        };
      }
    }
    return result;
  },

  "payflowpro/settings": function () {
    let settings = Paypal.payflowAccountOptions();
    let payflowSettings = {
      mode: settings.mode,
      enabled: settings.enabled
    };
    return payflowSettings;
  }
});
