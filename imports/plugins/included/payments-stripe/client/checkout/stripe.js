/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { $ } from "meteor/jquery";
import { getCardType } from "/client/modules/core/helpers/globals";
import { Router } from "/client/api";
import { Cart, Orders } from "/lib/collections";
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

// This creates an autorun block that monitors the CompletedCartOrder subscription
// and once an order for the cart we're checking out with is available,
// We trigger a Router.go to the cart/completed page.
Template.stripePaymentForm.onCreated(function () {
  // we need to cache the current "checkoutCart" because a new cart is created during copyCartToOrder
  const checkoutCart = Cart.findOne({ userId: Meteor.userId() });
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), checkoutCart._id);
  // Watch the orders subscription, once the order is created redirect to cart/completed
  this.autorun(() => {
    if (orderSub.ready()) {
      const order = Orders.findOne({ cartId: checkoutCart._id });
      if (order) {
        Router.go("cart/completed", {}, { _id: checkoutCart._id });
      }
    }
  });
});

//
// autoform handling
//
AutoForm.addHooks("stripe-payment-form", {
  onSubmit(doc) {
    submitting = true;
    hidePaymentAlert();
    const { template } = this;
    const cart = Cart.findOne({ userId: Meteor.userId() });

    // validate card data
    // also validated on server
    if (!validCardNumber(doc.cardNumber)) {
      submitting = false;
      const error = { message: "Your card number is incorrect" };
      handleStripeSubmitError(error);
      uiEnd(template, "Resubmit payment");
      return false;
    }

    if (!validExpireMonth(doc.expireMonth) || !validExpireYear(doc.expireYear)) {
      submitting = false;
      const error = { message: "Your expiration date is incorrect" };
      handleStripeSubmitError(error);
      uiEnd(template, "Resubmit payment");
      return false;
    }

    if (!validCVV(doc.cvv)) {
      submitting = false;
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
        submitting = false;
        if (error) {
          handleStripeSubmitError(error);
          uiEnd(template, "Resubmit payment");
        } else if (result.success) {
          Router.go("cart/completed", {}, {
            _id: cart._id
          });
        } else {
          handleStripeSubmitError(result.error);
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
