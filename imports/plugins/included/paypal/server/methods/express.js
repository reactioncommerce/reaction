import moment from "moment";
import _ from "lodash";
import { HTTP } from "meteor/http";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Paypal } from "../../lib/api";
import { Shops, Cart, Packages } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

let parseResponse;
let parseRefundReponse;
const nvpVersion = "52.0";

Meteor.methods({
  /**
   * Acquire the Token required for Paypal Express transactions
   * https://developer.paypal.com/docs/classic/api/merchant/SetExpressCheckout_API_Operation_NVP/
   * @param  {String} cartId Reference to the Cart object to be processed
   * @return {String} Paypal Token
   */
  "getExpressCheckoutToken": function (cartId) {
    check(cartId, String);
    this.unblock();
    let cart = Cart.findOne(cartId);
    if (!cart) {
      throw new Meteor.Error("Bad cart ID");
    }
    let shop = Shops.findOne(cart.shopId);
    if (!shop) {
      throw new Meteor.Error("Bad shop ID");
    }
    let amount = Number(cart.cartTotal());
    let description = shop.name + " Ref: " + cartId;
    let currency = shop.currency;
    let options = Paypal.expressCheckoutAccountOptions();
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
          RETURNURL: options.return_url,
          CANCELURL: options.cancel_url,
          DESC: description,
          NOSHIPPING: 1,
          ALLOWNOTE: 1,
          CURRENCYCODE: currency,
          METHOD: "SetExpressCheckout",
          INVNUM: cartId,
          CUSTOM: cartId + "|" + amount + "|" + currency
        }
      });
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("Bad response from PayPal");
    }
    let parsedResponse = parseResponse(response);
    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error("ACK " + parsedResponse.ACK + ": " + parsedResponse.L_LONGMESSAGE0);
    }
    return parsedResponse.TOKEN;
  },
  /**
   * Perform the Paypal Express payment application
   * https://developer.paypal.com/docs/classic/api/merchant/DoExpressCheckoutPayment_API_Operation_NVP/
   * @param  {String} cartId Reference to the cart we are checking out
   * @param  {String} token The Token provided by Paypal for this transaction
   * @param  {String} payerId Reference to the payer
   * @return {Object} results from PayPal normalized
   */
  "confirmPaymentAuthorization": function (cartId, token, payerId) {
    check(cartId, String);
    check(token, String);
    check(payerId, String);
    this.unblock();
    let cart = Cart.findOne(cartId);
    if (!cart) {
      throw new Meteor.Error("Bad cart ID");
    }
    let amount = Number(cart.cartTotal());
    let shop = Shops.findOne(cart.shopId);
    let currency = shop.currency;
    let options = Paypal.expressCheckoutAccountOptions();
    let captureAtAuth = getSetting(cart.shopId, "express_auth_and_capture");
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
          METHOD: "DoExpressCheckoutPayment",
          CURRENCYCODE: currency,
          TOKEN: token,
          PAYERID: payerId
        }
      });
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("Bad response from PayPal");
    }
    let parsedResponse = parseResponse(response);

    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error("ACK " +
        parsedResponse.ACK + ": " +
        parsedResponse.L_LONGMESSAGE0 + ":" +
        parsedResponse.L_ERRORCODE0);
    }
    return parsedResponse;
  },

  /**
   * Return the settings for the Paypal Express payment Method
   * @return {Object} Express Checkout settings
   */
  "getExpressCheckoutSettings": function () {
    let settings = Paypal.expressCheckoutAccountOptions();
    let expressCheckoutSettings = {
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
  "paypalexpress/payment/capture": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    this.unblock();
    let options = Paypal.expressCheckoutAccountOptions();
    let amount = paymentMethod.transactions[0].AMT;
    let authorizationId = paymentMethod.transactions[0].TRANSACTIONID;
    let currencycode = paymentMethod.transactions[0].CURRENCYCODE;
    let response;
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
      throw new Meteor.Error(error.message);
    }

    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("Bad Response from Paypal during Capture");
    }

    let parsedResponse = parseResponse(response);

    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error("ACK " + parsedResponse.ACK + ": " + parsedResponse.L_LONGMESSAGE0);
    }

    let result = {
      saved: true,
      authorizationId: parsedResponse.AUTHORIZATIONID,
      transactionId: parsedResponse.TRANSACTIONID,
      currencycode: currencycode,
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
  "paypalexpress/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    this.unblock();

    const options = Paypal.expressCheckoutAccountOptions();
    const previousTransaction = _.last(paymentMethod.transactions);
    const transactionId = previousTransaction.TRANSACTIONID;
    const currencycode = previousTransaction.CURRENCYCODE;

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
    }  catch (error) {
      Logger.debug(error, "Failed paypalexpress/refund/create");
      throw new Meteor.Error(error.message);
    }

    if (!response || response.statusCode !== 200) {
      Logger.debug(error, "Bad Response from Paypal during Refund Creation");
      throw new Meteor.Error("Bad Response from Paypal during Refund Creation");
    }

    let parsedResponse = parseResponse(response);
    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error("ACK " + parsedResponse.ACK + ": " + parsedResponse.L_LONGMESSAGE0);
    }

    let amountFormatted = {
      total: amount,
      currency: currencycode
    };

    let result = {
      saved: true,
      type: "refund",
      created: new Date(),
      transactionId: transactionId,
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
   * Query Paypal Express NVP API for Refund transactions
   * Refunds returned here are listed in the dashboard
   * https://developer.paypal.com/docs/classic/api/merchant/GetTransactionDetails_API_Operation_NVP/
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {array}  Refunds from PayPal query, normalized
   */
  "paypalexpress/refund/list": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    this.unblock();

    let options = Paypal.expressCheckoutAccountOptions();
    let transactionId = paymentMethod.transactionId;
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
    }  catch (error) {
      throw new Meteor.Error(error.message);
    }

    if (!response || response.statusCode !== 200) {
      throw new Meteor.Error("Bad Response from Paypal during refund list");
    }

    let parsedResponse = parseResponse(response);

    if (parsedResponse.ACK !== "Success") {
      throw new Meteor.Error("ACK " + parsedResponse.ACK + ": " + parsedResponse.L_LONGMESSAGE0);
    }
    let result = parseRefundReponse(parsedResponse);
    return result;
  }

});

parseResponse = function (response) {
  let result = {};
  let pieces = response.content.split("&");
  pieces.forEach(function (piece) {
    let subpieces = piece.split("=");
    let decodedResult = result[subpieces[0]] = decodeURIComponent(subpieces[1]);
    return decodedResult;
  });
  return result;
};

/**
 * Parse PayPal's 'unique' Transaction Query response to look for refunds
 * @param  {Object} response The response from Paypal
 * @return {Object} Refunds, normalized to an Array
 */
parseRefundReponse = function (response) {
  let paypalArray = [];

  for (let i = 0; i < 101; i++) {
    let timeStampKey = "L_TIMESTAMP" + i;
    let timestamp = response[timeStampKey];
    let typeKey = "L_TYPE" + i;
    let transactionType = response[typeKey];
    let amountKey = "L_AMT" + i;
    let amount = response[amountKey];
    let currencyCodeKey = "L_CURRENCYCODE" + i;
    let currencyCode = response[currencyCodeKey];

    if (timestamp !== undefined && transactionType === "Refund") {
      let responseObject = {
        created: moment(timestamp).valueOf(),
        type: "refund",
        amount: Math.abs(Number(amount, 10)),
        currency: currencyCode
      };
      paypalArray.push(responseObject);
    }
  }

  return paypalArray;
};

getSetting = function (shopId, parameter) {
  let settings = Packages.findOne({
    name: "reaction-paypal",
    shopId: shopId,
    enabled: true
  }).settings;
  return settings[parameter];
};
