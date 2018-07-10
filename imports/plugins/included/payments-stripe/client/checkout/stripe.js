/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { $ } from "meteor/jquery";
import { getCardType } from "/client/modules/core/helpers/globals";
import { Reaction, Router } from "/client/api";
import getCart from "/imports/plugins/core/cart/both/util/getCart";
import { StripePayment } from "../../lib/collections/schemas";

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
  // Match error on card number. Not submitted to stripe
  if (error && error.reason && error.reason === "Match failed") {
    const message = "Your card number is invalid. Please check the number and try again";
    return paymentAlert(message);
  }

  // this is a server message with a client-sanitized message
  if (error && error.message) {
    return paymentAlert(error.message);
  }
}

// Validation helpers
function luhnValid(x) {
  return [...x].reverse().reduce((sum, c, i) => {
    let d = parseInt(c, 10);
    if (i % 2 !== 0) { d *= 2; }
    if (d > 9) { d -= 9; }
    return sum + d;
  }, 0) % 10 === 0;
}

function validCardNumber(x) {
  return /^[0-9]{13,16}$/.test(x) && luhnValid(x);
}

function validExpireMonth(x) {
  return /^[0-9]{1,2}$/.test(x);
}

function validExpireYear(x) {
  return /^[0-9]{4}$/.test(x);
}

function validCVV(x) {
  return /^[0-9]{3,4}$/.test(x);
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
    Reaction.isSubmittingCheckoutPayment = true;
    hidePaymentAlert();
    const { template } = this;
    const { cart } = getCart();

    // validate card data
    // also validated on server
    if (!validCardNumber(doc.cardNumber)) {
      Reaction.isSubmittingCheckoutPayment = false;
      const error = { message: "Your card number is incorrect" };
      handleStripeSubmitError(error);
      uiEnd(template, "Resubmit payment");
      return false;
    }

    if (!validExpireMonth(doc.expireMonth) || !validExpireYear(doc.expireYear)) {
      Reaction.isSubmittingCheckoutPayment = false;
      const error = { message: "Your expiration date is incorrect" };
      handleStripeSubmitError(error);
      uiEnd(template, "Resubmit payment");
      return false;
    }

    if (!validCVV(doc.cvv)) {
      Reaction.isSubmittingCheckoutPayment = false;
      const error = { message: "Your cvv is incorrect" };
      handleStripeSubmitError(error);
      uiEnd(template, "Resubmit payment");
      return false;
    }


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
        if (result && result.success) {
          Router.go("cart/completed", {}, {
            _id: cart._id
          });
          // This prevents the "no items" empty state from appearing for the checkout route
          // after the purchased cart has been deleted, just prior to routing to /completed.
          // Therefore, keep it after the Router.go.
          Reaction.isSubmittingCheckoutPayment = false;
        } else {
          Reaction.isSubmittingCheckoutPayment = false;
          handleStripeSubmitError(error || result.error);
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
    if (!Reaction.isSubmittingCheckoutPayment) {
      return uiEnd(this.template, "Complete your order");
    }
  }
});
