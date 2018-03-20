import _ from "lodash";
import accounting from "accounting-js";
import { HTTP } from "meteor/http";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PayPal } from "../../lib/api";
import { Shops, Cart, Packages } from "/lib/collections";
import { Logger } from "/server/api";
import { PaymentMethodArgument } from "/lib/collections/schemas";

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment");
}

const nvpVersion = "52.0";

export const methods = {
  /**
   * Acquire the Token required for PayPal Express transactions
   * https://developer.paypal.com/docs/classic/api/merchant/SetExpressCheckout_API_Operation_NVP/
   * @param  {String} cartId Reference to the Cart object to be processed
   * @return {String} PayPal Token
   */
  "getExpressCheckoutToken"(cartId) {
    check(cartId, String);
    this.unblock();
    const cart = Cart.findOne(cartId);
    if (!cart) {
      throw new Meteor.Error("invalid-parameter", "Bad cart ID");
    }
    const shop = Shops.findOne(cart.shopId);
    if (!shop) {
      throw new Meteor.Error("invalid-parameter", "Bad shop ID");
    }
    const amount = Number(cart.getTotal());
    const shippingAmt = Number(cart.getShippingTotal());
    const taxAmt = Number(cart.getTaxTotal());
    const itemAmt = Number(cart.getSubTotal() - cart.getDiscounts());
    const description = `${shop.name} Ref: ${cartId}`;
    const { currency } = shop;
    const options = PayPal.expressCheckoutAccountOptions();
    let response;

    try {
      response = HTTP.post(options.url, {
        params: {
          USER: options.username,
          PWD: options.password,
          SIGNATURE: options.signature,
          SOLUTIONTYPE: "Mark",
          VERSION: nvpVersion,
          PAYMENTACTION: "Authorization",
          AMT: amount,
          ITEMAMT: itemAmt,
          SHIPPINGAMT: shippingAmt,
          TAXAMT: taxAmt,
          RETURNURL: options.return_url,
          CANCELURL: options.cancel_url,
          DESC: description,
          NOSHIPPING: 1,
          ALLOWNOTE: 1,
          CURRENCYCODE: currency,
          METHOD: "SetExpressCheckout",
          INVNUM: cartId,
          CUSTOM: `${cartId}|${amount}|${currency}`
        }
      });
    } catch (error) {
      throw new Meteor.Error("checkout-failed", error.message);
    }
    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("bad-response", "Bad response from PayPal");
    }
    const parsedResponse = parseResponse(response);
    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error(`ACK ${parsedResponse.ACK}: ${parsedResponse.L_LONGMESSAGE0}`);
    }
    return parsedResponse.TOKEN;
  },
  /**
   * Perform the PayPal Express payment application
   * https://developer.paypal.com/docs/classic/api/merchant/DoExpressCheckoutPayment_API_Operation_NVP/
   * @param  {String} cartId Reference to the cart we are checking out
   * @param  {String} token The Token provided by PayPal for this transaction
   * @param  {String} payerId Reference to the payer
   * @return {Object} results from PayPal normalized
   */
  "confirmPaymentAuthorization"(cartId, token, payerId) {
    check(cartId, String);
    check(token, String);
    check(payerId, String);
    this.unblock();
    const cart = Cart.findOne(cartId);
    if (!cart) {
      throw new Meteor.Error("invalid-parameter", "Bad cart ID");
    }
    const amount = Number(cart.getTotal());
    const shippingAmt = Number(cart.getShippingTotal());
    const taxAmt = Number(cart.getTaxTotal());
    const itemAmt = Number(cart.getSubTotal() - cart.getDiscounts());
    const shop = Shops.findOne(cart.shopId);
    const { currency } = shop;
    const options = PayPal.expressCheckoutAccountOptions();
    const captureAtAuth = getSetting(cart.shopId, "expressAuthAndCapture");
    let paymentAction;
    if (captureAtAuth) {
      paymentAction = "Sale";
    } else {
      paymentAction = "Authorization";
    }
    let response;
    try {
      response = HTTP.post(options.url, {
        params: {
          USER: options.username,
          PWD: options.password,
          SIGNATURE: options.signature,
          VERSION: nvpVersion,
          PAYMENTACTION: paymentAction,
          AMT: amount,
          ITEMAMT: itemAmt,
          SHIPPINGAMT: shippingAmt,
          TAXAMT: taxAmt,
          METHOD: "DoExpressCheckoutPayment",
          CURRENCYCODE: currency,
          TOKEN: token,
          PAYERID: payerId
        }
      });
    } catch (error) {
      throw new Meteor.Error("confirmation-failed", error.message);
    }
    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("bad-response", "Bad response from PayPal");
    }
    const parsedResponse = parseResponse(response);

    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error(`ACK ${parsedResponse.ACK}: ${parsedResponse.L_LONGMESSAGE0}:${parsedResponse.L_ERRORCODE0}`);
    }
    return parsedResponse;
  },

  /**
   * Return the settings for the PayPal Express payment Method
   * @return {Object} Express Checkout settings
   */
  "getExpressCheckoutSettings"() {
    const settings = PayPal.expressCheckoutAccountOptions();
    const expressCheckoutSettings = {
      merchantId: settings.merchantId,
      mode: settings.mode,
      enabled: settings.enabled
    };
    return expressCheckoutSettings;
  },

  /**
   * Capture an authorized PayPalExpress transaction
   * https://developer.paypal.com/docs/classic/api/merchant/DoCapture_API_Operation_NVP/
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {Object} results from PayPal normalized
   */
  "paypalexpress/payment/capture"(paymentMethod) {
    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));
    this.unblock();
    const options = PayPal.expressCheckoutAccountOptions();
    const amount = accounting.toFixed(paymentMethod.amount, 2);
    const authorizationId = paymentMethod.transactions[0].TRANSACTIONID;
    const currencycode = paymentMethod.transactions[0].CURRENCYCODE;
    let response;

    // 100% discounts are not valid when using PayPal Express
    // If discount is 100%, void authorization instead of applying discount
    if (amount === accounting.toFixed(0, 2)) {
      try {
        response = HTTP.post(options.url, {
          params: {
            USER: options.username,
            PWD: options.password,
            SIGNATURE: options.signature,
            VERSION: nvpVersion,
            METHOD: "DoVoid",
            AUTHORIZATIONID: authorizationId,
            NOTE: "Your order has been discounted 100%, and will appear as voided or canceled inside your payment account."
          }
        });
      } catch (error) {
        throw new Meteor.Error("capture-failed", error.message);
      }
    } else {
      try {
        response = HTTP.post(options.url, {
          params: {
            USER: options.username,
            PWD: options.password,
            SIGNATURE: options.signature,
            VERSION: nvpVersion,
            METHOD: "DoCapture",
            AUTHORIZATIONID: authorizationId,
            CURRENCYCODE: currencycode,
            AMT: amount,
            COMPLETETYPE: "Complete" // TODO: Allow for partial captures
          }
        });
      } catch (error) {
        throw new Meteor.Error("capture-failed", error.message);
      }
    }

    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("bad-response", "Bad Response from PayPal during Capture");
    }

    const parsedResponse = parseResponse(response);

    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error(`ACK ${parsedResponse.ACK}: ${parsedResponse.L_LONGMESSAGE0}`);
    }

    const result = {
      saved: true,
      authorizationId: parsedResponse.AUTHORIZATIONID,
      transactionId: parsedResponse.TRANSACTIONID,
      currencycode,
      metadata: {},
      rawTransaction: parsedResponse
    };

    return result;
  },

  /**
   * Refund an order using the PayPay Express method
   * https://developer.paypal.com/docs/classic/api/merchant/RefundTransaction_API_Operation_NVP/
   * @param  {Object} paymentMethod A PaymentMethod object
   * @param {Number} amount to be refunded
   * @return {Object} Transaction results from PayPal normalized
   */
  "paypalexpress/refund/create"(paymentMethod, amount) {
    check(amount, Number);

    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));
    this.unblock();

    const options = PayPal.expressCheckoutAccountOptions();
    const previousTransaction = _.last(paymentMethod.transactions);
    const { transactionId, currencycode } = previousTransaction;

    let response;
    try {
      response = HTTP.post(options.url, {
        params: {
          USER: options.username,
          PWD: options.password,
          SIGNATURE: options.signature,
          VERSION: nvpVersion,
          METHOD: "RefundTransaction",
          TRANSACTIONID: transactionId,
          REFUNDTYPE: "Partial",
          AMT: amount,
          CURRENCYCODE: currencycode
        }
      });
    } catch (error) {
      Logger.debug(error, "Failed paypalexpress/refund/create");
      throw new Meteor.Error("refund-create-failed", error.message);
    }

    if (!response || response.statusCode !== 200) {
      Logger.debug("Bad Response from PayPal during Refund Creation");
      throw new Meteor.Error("bad-response", "Bad Response from PayPal during Refund Creation");
    }

    const parsedResponse = parseResponse(response);
    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error(`ACK ${parsedResponse.ACK}: ${parsedResponse.L_LONGMESSAGE0}`);
    }

    const amountFormatted = {
      total: amount,
      currency: currencycode
    };

    const result = {
      saved: true,
      type: "refund",
      created: new Date(),
      transactionId,
      refundTransactionId: parsedResponse.REFUNDTRANSACTIONID,
      grossRefundAmount: parsedResponse.GROSSREFUNDAMT,
      netRefundAmount: parsedResponse.NETREFUNDAMT,
      correlationId: parsedResponse.CORRELATIONID,
      currencycode: parsedResponse.CURRENCYCODE,
      amount: amountFormatted,
      rawTransaction: parsedResponse
    };
    return result;
  },
  /**
   * Query PayPal Express NVP API for Refund transactions
   * Refunds returned here are listed in the dashboard
   * https://developer.paypal.com/docs/classic/api/merchant/GetTransactionDetails_API_Operation_NVP/
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {array}  Refunds from PayPal query, normalized
   */
  "paypalexpress/refund/list"(paymentMethod) {
    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));
    this.unblock();

    const options = PayPal.expressCheckoutAccountOptions();
    const { transactionId } = paymentMethod;
    let response;

    try {
      response = HTTP.post(options.url, {
        params: {
          USER: options.username,
          PWD: options.password,
          SIGNATURE: options.signature,
          VERSION: nvpVersion,
          METHOD: "TransactionSearch",
          STARTDATE: "2013-08-24T05:38:48Z",
          TRANSACTIONID: transactionId,
          TRANSACTIONCLASS: "Refund"
        }
      });
    } catch (error) {
      throw new Meteor.Error("refund-list-failed", error.message);
    }

    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("bad-response", "Bad Response from PayPal during refund list");
    }

    const parsedResponse = parseResponse(response);

    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error(`ACK ${parsedResponse.ACK}: ${parsedResponse.L_LONGMESSAGE0}`);
    }
    const result = parseRefundReponse(parsedResponse);
    return result;
  }

};

// internal helpers
function parseResponse(response) {
  const result = {};
  const pieces = response.content.split("&");
  pieces.forEach((piece) => {
    const subpieces = piece.split("=");
    result[subpieces[0]] = decodeURIComponent(subpieces[1]);
    const decodedResult = result[subpieces[0]];
    return decodedResult;
  });
  return result;
}

/**
 * Parse PayPal's 'unique' Transaction Query response to look for refunds
 * @param  {Object} response The response from PayPal
 * @return {Object} Refunds, normalized to an Array
 */
function parseRefundReponse(response) {
  const paypalArray = [];

  Promise.await(lazyLoadMoment());

  for (let i = 0; i < 101; i += 1) {
    const timeStampKey = `L_TIMESTAMP${i}`;
    const timestamp = response[timeStampKey];
    const typeKey = `L_TYPE${i}`;
    const transactionType = response[typeKey];
    const amountKey = `L_AMT${i}`;
    const amount = response[amountKey];
    const currencyCodeKey = `L_CURRENCYCODE${i}`;
    const currencyCode = response[currencyCodeKey];

    if (timestamp !== undefined && transactionType === "Refund") {
      const responseObject = {
        created: moment(timestamp).valueOf(),
        type: "refund",
        amount: Math.abs(Number(amount, 10)),
        currency: currencyCode
      };
      paypalArray.push(responseObject);
    }
  }

  return paypalArray;
}

function getSetting(shopId, parameter) {
  const { settings } = Packages.findOne({
    name: "reaction-paypal",
    shopId,
    enabled: true
  });
  return settings[parameter];
}

// export methods to Meteor
Meteor.methods(methods);
