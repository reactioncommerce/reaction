import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Tracker } from "meteor/tracker";
import { $ } from "meteor/jquery";
import { Reaction } from "/client/api";
import { Cart, Packages } from "/lib/collections";
import Logger from "/client/modules/logger";

// This template handles receiving the token from Paypal, recording it and moving on the checkout

function isDuplicate(error) {
  const errorMessage = error.message;
  const duplicateErrorCode = "10415";
  return errorMessage.indexOf(duplicateErrorCode) > -1;
}

function showError(error) {
  $(".spinner-container").hide();
  $("#paypal-error-message").text(error);
  $(".paypal-done-error").show();
}

function buildPaymentMethod(result, status, mode) {
  Meteor.subscribe("Packages", Reaction.getShopId());
  const packageData = Packages.findOne({
    name: "reaction-paypal",
    shopId: Reaction.getShopId()
  });

  const paymentMethod = {
    processor: "PaypalExpress",
    paymentPackageId: packageData._id,
    paymentSettingsKey: packageData.registry[0].settingsKey,
    method: "credit",
    transactionId: result.TRANSACTIONID,
    amount: parseFloat(result.AMT, 10),
    status,
    mode,
    createdAt: new Date(result.ORDERTIME),
    updatedAt: new Date(result.ORDERTIME),
    transactions: [result]
  };
  return paymentMethod;
}

Template.paypalDone.onRendered(() => {
  $(".paypal-done-error").hide();
});

Template.paypalDone.helpers({
  checkoutUrl() {
    const template = Template.instance();
    return template.checkoutUrl;
  }
});

Template.paypalDone.onCreated(function () {
  const payerId = Reaction.Router.getQueryParam("PayerID");
  const token = Reaction.Router.getQueryParam("token");
  const prefix = Reaction.getShopPrefix();
  this.checkoutUrl = `${prefix}/cart/checkout`;
  // wait for cart to be ready
  Tracker.autorun((c) => {
    if (Reaction.Subscriptions.Cart.ready()) {
      const cart = Cart.findOne();
      if (!cart) {
        Logger.warn("Could not find valid cart");
        return;
      }
      c.stop();
      if (Session.get("expressToken") !== token) {
        Session.set("expressToken", token);
        Meteor.call("confirmPaymentAuthorization", cart._id, token, payerId, (error, result) => {
          if (error) {
            if (isDuplicate(error)) {
              Reaction.Router.go("cart/completed", {}, {
                _id: cart._id
              });
            }
            const msg = (error !== null ? error.error : undefined);
            showError(msg);
          }

          if (result) {
            let status;
            let mode = "authorize";
            // Normalize status depending on results
            if (result.PAYMENTSTATUS === "Pending") {
              status = "created";
            } else if (result.PAYMENTSTATUS === "Completed") { // If we set capture at auth this will be completed
              status = "completed";
              mode = "capture";
            } else {
              status = result.PAYMENTSTATUS;
            }
            const paymentMethod = buildPaymentMethod(result, status, mode);

            Meteor.call("cart/submitPayment", paymentMethod, (payError, payResult) => {
              if (!payResult && payError) {
                Logger.warn(payError, "Error received during submitting Payment via Paypal");
                showError(payError);
                Session.set("guestCheckoutFlow", true);
              }
            });
          }
        });
      }
    }
  });
});
