/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { $ } from "meteor/jquery";
import { getCardType } from "/client/modules/core/helpers/globals";
import { Router } from "/client/api";
import { Cart } from "/lib/collections";
import { StripePayment } from "../../lib/collections/schemas";

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
  // Match eror on card number. Not submitted to stripe
  if (error && error.reason && error.reason === "Match failed") {
    const message = "Your card number is invalid. Please check the number and try again";
    return paymentAlert(message);
  }

  // this is a server message with a client-sanitized message
  if (error && error.details) {
    return paymentAlert(error.details);
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
    hidePaymentAlert();
    const template = this.template;
    const cart = Cart.findOne({ userId: Meteor.userId() });
    const cardData = {
      name: doc.payerName,
      number: doc.cardNumber,
      expire_month: doc.expireMonth,
      expire_year: doc.expireYear,
      cvv2: doc.cvv,
      type: getCardType(doc.cardNumber)
    };

    // Use apply instead of call here to prevent the flash of "your cart is empty"
    // that happens when we wait for the cart subscription to update before forwarding
    Meteor.apply("stripe/payment/createCharges", ["authorize", cardData, cart._id], {
      onResultReceived: (error, result) => {
        submitting = false;
        if (error) {
          handleStripeSubmitError(error);
          uiEnd(template, "Resubmit payment");
        } else {
          if (result.success) {
            Router.go("cart/completed", {}, {
              _id: cart._id
            });
          } else {
            handleStripeSubmitError(result.error);
            uiEnd(template, "Resubmit payment");
          }
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
