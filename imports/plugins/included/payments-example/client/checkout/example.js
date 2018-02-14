/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { $ } from "meteor/jquery";
import { Reaction } from "/client/api";
import { Cart, Shops, Packages } from "/lib/collections";
import { Example } from "../../lib/api";
import { ExamplePayment } from "../../lib/collections/schemas";

import "./example.html";

let submitting = false;

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

function handleExampleSubmitError(error) {
  const serverError = error !== null ? error.message : undefined;
  if (serverError) {
    return paymentAlert(`Oops! ${serverError}`);
  } else if (error) {
    return paymentAlert(`Oops! ${error}`, null, 4);
  }
}


Template.examplePaymentForm.helpers({
  ExamplePayment() {
    return ExamplePayment;
  }
});

AutoForm.addHooks("example-payment-form", {
  onSubmit(doc) {
    submitting = true;
    const { template } = this;
    hidePaymentAlert();
    const form = {
      name: doc.payerName,
      number: doc.cardNumber,
      expireMonth: doc.expireMonth,
      expireYear: doc.expireYear,
      cvv2: doc.cvv,
      type: Reaction.getCardType(doc.cardNumber)
    };
    const storedCard = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} ${doc.cardNumber.slice(-4)}`;
    Meteor.subscribe("Packages", Reaction.getShopId());
    const packageData = Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
    Example.authorize(form, {
      total: Cart.findOne().getTotal(),
      currency: Shops.findOne().currency
    }, (error, transaction) => {
      submitting = false;
      let paymentMethod;
      if (error) {
        handleExampleSubmitError(error);
        uiEnd(template, "Resubmit payment");
      } else if (transaction.saved === true) {
        submitting = false;
        paymentMethod = {
          processor: "Example",
          paymentPackageId: packageData._id,
          paymentSettingsKey: packageData.registry[0].settingsKey,
          storedCard,
          method: "credit",
          transactionId: transaction.transactionId,
          riskLevel: transaction.riskLevel,
          currency: transaction.currency,
          amount: transaction.amount,
          status: transaction.status,
          mode: "authorize",
          createdAt: new Date(),
          transactions: []
        };
        paymentMethod.transactions.push(transaction.response);
        Meteor.call("cart/submitPayment", paymentMethod);
      } else {
        handleExampleSubmitError(transaction.error);
        uiEnd(template, "Resubmit payment");
      }
    });
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
