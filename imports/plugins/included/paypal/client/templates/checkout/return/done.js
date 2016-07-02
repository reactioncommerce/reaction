import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";
import Logger from "/client/modules/logger";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Tracker } from "meteor/tracker";

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
  let paymentMethod = {
    processor: "PaypalExpress",
    method: "Paypal Express Checkout",
    transactionId: result.TRANSACTIONID,
    amount: parseFloat(result.AMT, 10),
    status: status,
    mode: mode,
    createdAt: new Date(result.ORDERTIME),
    updatedAt: new Date(result.ORDERTIME),
    transactions: [result]
  };
  return paymentMethod;
}

Template.paypalDone.onRendered(function () {
  $(".paypal-done-error").hide();
});

Template.paypalDone.helpers({
  checkoutUrl: function () {
    template = Template.instance();
    return template.checkoutUrl;
  }
});


Template.paypalDone.onCreated(function () {
  const payerId = Reaction.Router.getQueryParam("PayerID");
  const token = Reaction.Router.getQueryParam("token");
  const prefix = Reaction.getSlug(Reaction.getShopName().toLowerCase());
  this.checkoutUrl = `/${prefix}/cart/checkout`;
  // wait for cart to be ready
  Tracker.autorun(function (c) {
    if (Reaction.Subscriptions.Cart.ready()) {
      let cart = Cart.findOne();
      if (!cart) {
        Logger.warn("Could not find valid cart");
        return;
      }
      c.stop();
      if (Session.get("expressToken") !== token) {
        Session.set("expressToken", token);
        Meteor.call("confirmPaymentAuthorization", cart._id, token, payerId, function (error, result) {
          if (error) {
            if (isDuplicate(error)) {
              Reaction.Router.go("cart/completed", {}, {
                _id: cart._id
              });
            }
            const msg = (error !== null ? error.error : void 0);
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

            Meteor.call("cart/submitPayment", paymentMethod, function (error, result) {
              if (!result && error) {
                Logger.warn(error, "Error received during submitting Payment via Paypal");
                showError(error);
                Session.set("guestCheckoutFlow", true);
              }
            });
          }
        });
      }
    }
  });
});
