/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import Logger from "/client/modules/logger";
import { Cart, Shops, Packages } from "/lib/collections";
import { PaypalPayment } from "/imports/plugins/included/payments-paypal/lib/collections/schemas";
import { Reaction, i18next } from "/client/api";
import { PayPal } from "/imports/plugins/included/payments-paypal/lib/api";
import "./payflowForm.html";


function uiEnd(template, buttonText) {
  template.$(".cart-checkout-step *").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
}

function paymentAlert(errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
}

function hidePaymentAlert() {
  return $(".alert").addClass("hidden").text("");
}

function getError(error, detailSubpart) {
  if (error) {
    if (error.response) {
      return error.response[detailSubpart];
    }
  }
  return undefined;
}

function handlePaypalSubmitError(error) {
  const results = [];
  const singleError = getError(error, "error_description");
  const serverError = getError(error, "message");
  const errors = getError(error, "response") || [];
  if (singleError) {
    return paymentAlert("Oops! " + singleError);
  } else if (errors.length) {
    for (let i = 0, len = errors.length; i < len; i++) {
      const thisError = errors[i];
      const formattedError = "Oops! " + thisError.issue + ": " + thisError.field.split(/[. ]+/).pop().replace(/_/g, " ");
      results.push(paymentAlert(formattedError));
    }
    return results;
  } else if (serverError) {
    // Alerts.toast(i18next.t("checkout.unknownError", { err: serverError }), "error");
    return paymentAlert(i18next.t("checkout.paymentMethod.unknownError"));
  }
  Logger.fatal("An unknown error has occurred while processing a Paypal payment");
  return paymentAlert(i18next.t("checkout.paymentMethod.unknownError"));
}

//
// paypal payflow form helpers
//
Template.paypalPayflowForm.helpers({
  PaypalPayment: function () {
    return PaypalPayment;
  }
});

//
// autoform handling
//
AutoForm.addHooks("paypal-payment-form", {
  onSubmit: function (doc) {
    hidePaymentAlert();
    const template = this.template;
    const payerNamePieces = doc.payerName.split(" ");
    const form = {
      first_name: payerNamePieces[0],
      last_name: payerNamePieces[1],
      number: doc.cardNumber,
      expire_month: doc.expireMonth,
      expire_year: doc.expireYear,
      cvv2: doc.cvv,
      type: Reaction.getCardType(doc.cardNumber)
    };
    const storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1) + " " + doc.cardNumber.slice(-4);
    PayPal.authorize(form, {
      total: Cart.findOne().cartTotal(),
      currency: Shops.findOne().currency
    }, function (error, transaction) {
      submitting = false; // todo: check scope
      if (error) {
        handlePaypalSubmitError(error);
        uiEnd(template, i18next.t("checkout.paymentMethod.resubmit"));
      } else {
        if (transaction.saved === true) {
          const normalizedStatus = (function () {
            switch (transaction.response.state) {
              case "created":
                return "created";
              case "approved":
                return "created";
              case "failed":
                return "failed";
              case "canceled":
                return "canceled";
              case "expired":
                return "expired";
              case "pending":
                return "pending";
              default:
                return "failed";
            }
          })();

          const normalizedMode = (function () {
            switch (transaction.response.intent) {
              case "sale":
                return "capture";
              case "authorize":
                return "authorize";
              case "order":
                return "capture";
              default:
                return "capture";
            }
          })();

          // just auth, not transaction
          const transactionId = transaction.response.id;
          // when auth and transaction
          let authId;
          if (typeof transaction.response.transactions[0].related_resources[0] === "object") {
            authId = transaction.response.transactions[0].related_resources[0].authorization.id;
          }
          Meteor.subscribe("Packages");
          const packageData = Packages.findOne({
            name: "reaction-paypal",
            shopId: Reaction.getShopId()
          });

          const paymentMethod = {
            processor: "PayflowPro",
            paymentPackageId: packageData._id,
            paymentSettingsKey: packageData.registry[0].settingsKey,
            storedCard: storedCard,
            method: "credit",
            authorization: authId,
            transactionId: transactionId,
            metadata: {
              transactionId: transactionId,
              authorizationId: authId
            },
            amount: Number(transaction.response.transactions[0].amount.total),
            status: normalizedStatus,
            mode: normalizedMode,
            createdAt: new Date(transaction.response.create_time),
            updatedAt: new Date(transaction.response.update_time),
            transactions: []
          };
          paymentMethod.transactions.push(transaction.response);
          Meteor.call("cart/submitPayment", paymentMethod);
        } else {
          handlePaypalSubmitError(transaction.error);
          uiEnd(template, i18next.t("checkout.paymentMethod.resubmit"));
        }
      }
    });
    return false;
  },
  beginSubmit: function () {
    this.template.$(".cart-checkout-step *").attr("disabled", true);
    this.template.$("#btn-complete-order").text(i18next.t("checkout.paymentMethod.submitting"));
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit: function () {
    if (!submitting) {
      return uiEnd(this.template, i18next.t("checkout.completeYourOrder"));
    }
    return undefined;
  }
});
