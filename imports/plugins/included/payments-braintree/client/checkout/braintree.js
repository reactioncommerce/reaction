/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { getCardType } from "/client/modules/core/helpers/globals";
import { Cart, Shops } from "/lib/collections";
import { Braintree } from "../api/braintree";
import { BraintreePayment } from "../../lib/collections/schemas";

import "./braintree.html";

Template.braintreePaymentForm.helpers({
  BraintreePayment() {
    return BraintreePayment;
  }
});


uiEnd = function (template, buttonText) {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
};

paymentAlert = function (errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
};

hidePaymentAlert = function () {
  return $(".alert").addClass("hidden").text("");
};

handleBraintreeSubmitError = function (error) {
  const serverError = error !== null ? error.message : void 0;
  if (serverError) {
    return paymentAlert("Server Error " + serverError);
  } else if (error) {
    return paymentAlert("Oops! Credit card is invalid. Please check your information and try again.");
  }
};

let submitting = false;

submitToBrainTree = function (doc, template) {
  submitting = true;
  hidePaymentAlert();
  const cardData = {
    name: doc.payerName,
    number: doc.cardNumber,
    expirationMonth: doc.expireMonth,
    expirationYear: doc.expireYear,
    cvv2: doc.cvv,
    type: getCardType(doc.cardNumber)
  };
  const cartTotal = Cart.findOne().cartTotal();
  const currencyCode = Shops.findOne().currency;

  Braintree.authorize(cardData, {
    total: cartTotal,
    currency: currencyCode
  }, function (error, results) {
    let paymentMethod;
    submitting = false;
    if (error) {
      handleBraintreeSubmitError(error);
      uiEnd(template, "Resubmit payment");
    } else {
      if (results.saved === true) {
        const normalizedStatus = normalizeState(results.response.transaction.status);
        const normalizedMode = normalizeMode(results.response.transaction.status);
        const storedCard = results.response.transaction.creditCard.cardType.toUpperCase() + " " + results.response.transaction.creditCard.last4;
        paymentMethod = {
          processor: "Braintree",
          storedCard: storedCard,
          method: results.response.transaction.creditCard.cardType,
          transactionId: results.response.transaction.id,
          amount: parseFloat(results.response.transaction.amount),
          status: normalizedStatus,
          mode: normalizedMode,
          createdAt: new Date(),
          updatedAt: new Date(),
          transactions: []
        };
        paymentMethod.transactions.push(results.response);
        Meteor.call("cart/submitPayment", paymentMethod);
      } else {
        handleBraintreeSubmitError(results.response.message);
        uiEnd(template, "Resubmit payment");
      }
    }
  });
};

AutoForm.addHooks("braintree-payment-form", {
  onSubmit: function (doc) {
    submitToBrainTree(doc, this.template);
    return false;
  },
  beginSubmit: function () {
    this.template.$(":input").attr("disabled", true);
    this.template.$("#btn-complete-order").text("Submitting ");
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit: function () {
    if (!submitting) {
      return uiEnd(this.template, "Complete your order");
    }
  }
});

const normalizedStates = {
  authorization_expired: "expired",
  authorized: "created",
  authorizing: "pending",
  settlement_pending: "pending",
  settlement_confirmed: "settled",
  settlement_declined: "failed",
  failed: "failed",
  gateway_rejected: "failed",
  processor_declined: "failed",
  settled: "settled",
  settling: "pending",
  submitted_for_settlement: "pending",
  voided: "voided",
  default: "failed"
};

normalizeState = function (stateString) {
  let normalizedState = normalizedStates[stateString];
  if (typeof normalizedState === "undefined") {
    normalizedState = normalizedStates.default;
  }
  return normalizedState;
};

const normalizedModes = {
  settled: "capture",
  settling: "capture",
  submitted_for_settlement: "capture",
  settlement_confirmed: "capture",
  authorized: "authorize",
  authorizing: "authorize",
  default: "capture"
};

normalizeMode = function (modeString) {
  let normalizedMode = normalizedModes[modeString];
  if (typeof normalizedMode === "undefined") {
    normalizedMode = normalizedModes.default;
  }
  return normalizedMode;
};
