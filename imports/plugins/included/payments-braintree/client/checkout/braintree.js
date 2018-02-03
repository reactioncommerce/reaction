/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { $ } from "meteor/jquery";
import { getCardType } from "/client/modules/core/helpers/globals";
import { Cart, Shops, Packages } from "/lib/collections";
import { Braintree } from "../api/braintree";
import { Reaction } from "/client/api";
import { BraintreePayment } from "../../lib/collections/schemas";

import "./braintree.html";

Template.braintreePaymentForm.helpers({
  BraintreePayment() {
    return BraintreePayment;
  }
});


function uiEnd(template, buttonText) {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
}

function paymentAlert(errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
}

function hidePaymentAlert() {
  return $(".alert").addClass("hidden").text("");
}

function handleBraintreeSubmitError(error) {
  const serverError = error !== null ? error.message : undefined;
  if (serverError) {
    return paymentAlert(`Server Error ${serverError}`);
  } else if (error) {
    return paymentAlert("Oops! Credit card is invalid. Please check your information and try again.");
  }
}

let submitting = false;

function submitToBrainTree(doc, template) {
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
  const cartTotal = Cart.findOne().getTotal();
  const currencyCode = Shops.findOne().currency;

  Braintree.authorize(cardData, {
    total: cartTotal,
    currency: currencyCode
  }, (error, results) => {
    let paymentMethod;
    submitting = false;
    if (error) {
      handleBraintreeSubmitError(error);
      uiEnd(template, "Resubmit payment");
    } else if (results.saved === true) {
      const tx = results && results.response && results.response.transaction;
      const normalizedStatus = normalizeState(tx.status);
      const normalizedMode = normalizeMode(tx.status);
      Meteor.subscribe("Packages", Reaction.getShopId());
      const packageData = Packages.findOne({
        name: "reaction-braintree",
        shopId: Reaction.getShopId()
      });

      const storedCard = `${tx.creditCard.cardType.toUpperCase()} ${tx.creditCard.last4}`;
      paymentMethod = {
        processor: "Braintree",
        storedCard,
        paymentPackageId: packageData._id,
        paymentSettingsKey: packageData.registry[0].settingsKey,
        method: "credit",
        transactionId: tx.id,
        amount: parseFloat(tx.amount),
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
  });
}

AutoForm.addHooks("braintree-payment-form", {
  onSubmit(doc) {
    submitToBrainTree(doc, this.template);
    return false;
  },
  beginSubmit() {
    this.template.$(":input").attr("disabled", true);
    this.template.$("#btn-complete-order").text("Submitting ");
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit() {
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

function normalizeState(stateString) {
  let normalizedState = normalizedStates[stateString];
  if (typeof normalizedState === "undefined") {
    normalizedState = normalizedStates.default;
  }
  return normalizedState;
}

const normalizedModes = {
  settled: "capture",
  settling: "capture",
  submitted_for_settlement: "capture",
  settlement_confirmed: "capture",
  authorized: "authorize",
  authorizing: "authorize",
  default: "capture"
};

function normalizeMode(modeString) {
  let normalizedMode = normalizedModes[modeString];
  if (typeof normalizedMode === "undefined") {
    normalizedMode = normalizedModes.default;
  }
  return normalizedMode;
}
