/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { getCardType } from "/client/modules/core/helpers/globals";
import { Reaction } from "/client/api";
import { Cart, Shops, Packages } from "/lib/collections";
import { Stripe } from "../../lib/api";
import { StripePayment } from "../../lib/collections/schemas";

import "./stripe.html";

let submitting = false;

//
// local helpers
//
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

function handleStripeSubmitError(error) {
  const singleError = error;
  const serverError = error ? error.message : null;
  if (serverError) {
    return paymentAlert("Oops! Credit card is invalid. Please check your information and try again.");
  } else if (singleError) {
    return paymentAlert("Oops! " + singleError);
  }
}

//
// Template helpers
//
Template.stripePaymentForm.helpers({
  StripePayment() {
    return StripePayment;
  }
});

//
// autoform handling
//
AutoForm.addHooks("stripe-payment-form", {
  onSubmit(doc) {
    submitting = true;
    const template = this.template;
    hidePaymentAlert();
    const cardData = {
      name: doc.payerName,
      number: doc.cardNumber,
      expire_month: doc.expireMonth,
      expire_year: doc.expireYear,
      cvv2: doc.cvv,
      type: getCardType(doc.cardNumber)
    };
    const storedCard = cardData.type.charAt(0).toUpperCase() + cardData.type.slice(1) + " " + doc.cardNumber.slice(-4);
    Stripe.authorize(cardData, {
      total: Cart.findOne().cartTotal(),
      currency: Shops.findOne().currency
    }, function (error, transaction) {
      submitting = false;
      if (error) {
        handleStripeSubmitError(error);
        uiEnd(template, "Resubmit payment");
      } else {
        if (transaction.saved === true) {
          const normalizedStatus = (function () {
            switch (false) {
              case !(!transaction.response.captured && !transaction.response.failure_code):
                return "created";
              case !(transaction.response.captured === true && !transaction.response.failure_code):
                return "settled";
              case !transaction.response.failure_code:
                return "failed";
              default:
                return "failed";
            }
          })();
          const normalizedMode = (function () {
            switch (false) {
              case !(!transaction.response.captured && !transaction.response.failure_code):
                return "authorize";
              case !transaction.response.captured:
                return "capture";
              default:
                return "capture";
            }
          })();
          Meteor.subscribe("Packages");
          const packageData = Packages.findOne({
            name: "reaction-stripe",
            shopId: Reaction.getShopId()
          });

          submitting = false;
          paymentMethod = {
            processor: "Stripe",
            storedCard: storedCard,
            method: "credit",
            paymentPackageId: packageData._id,
            paymentSettingsKey: packageData.registry[0].settingsKey,
            transactionId: transaction.response.id,
            amount: transaction.response.amount * 0.01,
            status: normalizedStatus,
            mode: normalizedMode,
            createdAt: new Date(transaction.response.created),
            transactions: []
          };
          paymentMethod.transactions.push(transaction.response);
          Meteor.call("cart/submitPayment", paymentMethod);
        } else {
          handleStripeSubmitError(transaction.error);
          uiEnd(template, "Resubmit payment");
        }
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
