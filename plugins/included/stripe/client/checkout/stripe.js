/* eslint camelcase: 0 */
import {
  Cart,
  Shops
} from "/lib/collections";

import {
  StripePayment
} from "../../lib/collections/schemas";

//
// local helpers
//
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

handleStripeSubmitError = function (error) {
  let singleError = error;
  let serverError = error !== null ? error.message : void 0;
  if (serverError) {
    return paymentAlert("Oops! " + serverError);
  } else if (singleError) {
    return paymentAlert("Oops! " + singleError);
  }
};

//
// Template helpers
//
Template.stripePaymentForm.helpers({
  StripePayment: function () {
    return StripePayment;
  }
});

//
// autoform handling
//
AutoForm.addHooks("stripe-payment-form", {
  onSubmit: function (doc) {
    let template = this.template;
    hidePaymentAlert();
    let form = {
      name: doc.payerName,
      number: doc.cardNumber,
      expire_month: doc.expireMonth,
      expire_year: doc.expireYear,
      cvv2: doc.cvv,
      type: getCardType(doc.cardNumber)
    };
    let storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1) + " " + doc.cardNumber.slice(-4);
    Meteor.Stripe.authorize(form, {
      total: Cart.findOne().cartTotal(),
      currency: Shops.findOne().currency
    }, function (error, transaction) {
      submitting = false;
      if (error) {
        handleStripeSubmitError(error);
        uiEnd(template, "Resubmit payment");
      } else {
        if (transaction.saved === true) {
          let normalizedStatus = (function () {
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
          let normalizedMode = (function () {
            switch (false) {
            case !(!transaction.response.captured && !transaction.response.failure_code):
              return "authorize";
            case !transaction.response.captured:
              return "capture";
            default:
              return "capture";
            }
          })();
          paymentMethod = {
            processor: "Stripe",
            storedCard: storedCard,
            method: transaction.response.source.funding,
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
