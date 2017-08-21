/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import Reaction from "/lib/api";

// using global instance of Reaction
// Paypal is a shared client/server stub
// to provide normalized PayPal tooling

export const PayFlow = {
  payflowAccountOptions: function () {
    const settings = Packages.findOne({
      name: "reaction-paypal",
      shopId: Reaction.getShopId(),
      enabled: true
    }).settings;
    let mode;
    if ((settings !== null ? settings.payflow_mode : void 0) === true) {
      mode = "live";
    } else {
      mode = "sandbox";
    }
    const ref = Meteor.settings.paypal;
    const options = {
      mode: mode,
      enabled: getSettings(settings, ref, "payflow_enabled"),
      client_id: getSettings(settings, ref, "client_id"),
      client_secret: getSettings(settings, ref, "client_secret")
    };
    if (!options.client_id) {
      throw new Meteor.Error(403, "Invalid PayPal Credentials");
    }
    return options;
  },
  authorize: function (cardInfo, paymentInfo, callback) {
    Meteor.call("payflowpro/payment/submit", "authorize", cardInfo, paymentInfo, callback);
  },
  capture: function (transactionId, amount, callback) {
    const captureDetails = {
      amount: {
        currency: "USD", // todo should this be locale.currency
        total: parseFloat(amount, 10)
      },
      is_final_capture: true
    };
    Meteor.call("payflowpro/payment/capture", transactionId, captureDetails, callback);
  },
  config: function (options) {
    this.accountOptions = options;
  },
  paymentObj: function () {
    return {
      intent: "sale",
      payer: {
        payment_method: "credit_card",
        funding_instruments: []
      },
      transactions: []
    };
  },
  parseCardData: function (data) {
    return {
      credit_card: {
        type: data.type,
        number: data.number,
        first_name: data.first_name,
        last_name: data.last_name,
        cvv2: data.cvv2,
        expire_month: data.expire_month,
        expire_year: data.expire_year
      }
    };
  },
  parsePaymentData: function (data) {
    return {
      amount: {
        total: parseFloat(data.total, 10),
        currency: data.currency
      }
    };
  }
};

function getSettings(settings, ref, valueName) {
  if (settings !== null) {
    return settings[valueName];
  } else if (ref !== null) {
    return ref[valueName];
  }
  return {};
}
