import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Logger, Reaction, i18next } from "/client/api";
import { Cart } from "/lib/collections";

// Client Cart Methods
// Stubs with matching server methods.
Meteor.methods({
  // Not used for stripe connect integration
  // Under consideration for deprecation and migrating other payment Packages
  // to payments-stripe style methods
  "cart/submitPayment"(paymentMethod) {
    check(paymentMethod, Object);
    const checkoutCart = Cart.findOne({
      userId: Meteor.userId()
    });

    const cart = _.clone(checkoutCart);
    const cartId = cart._id;
    const invoice = {
      shipping: cart.getShippingTotal(),
      subtotal: cart.getSubTotal(),
      taxes: cart.getTaxTotal(),
      discounts: cart.getDiscounts(),
      total: cart.getTotal()
    };
    // we won't actually close the order at this stage.
    // we'll just update the workflow and billing data where
    // method-hooks can process the workflow update.

    let selector;
    let update;
    // temp hack until we build out multiple billing handlers
    // if we have an existing item update it, otherwise add to set.
    if (cart.billing) {
      selector = {
        "_id": cartId,
        "billing._id": cart.billing[0]._id
      };
      update = {
        $set: {
          "billing.$.paymentMethod": paymentMethod,
          "billing.$.invoice": invoice
        }
      };
    } else {
      selector = {
        _id: cartId
      };
      update = {
        $addToSet: {
          "billing.paymentMethod": paymentMethod,
          "billing.invoice": invoice
        }
      };
    }

    Cart.update(selector, update, (error, result) => {
      if (error) {
        Logger.debug(error, "An error occurred saving the order");
        throw new Meteor.Error("An error occurred saving the order", error);
      } else {
        // it's ok and a safety check for this to be called multiple times
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "paymentSubmitted");
        // Client Stub Actions
        if (result === 1) {
          Reaction.Router.go("cart/completed", {}, {
            _id: cartId
          });
        } else {
          Alerts.inline(i18next.t("checkoutPayment.failedToPlaceOrder"), "danger", {
            autoHide: true,
            placement: "paymentMethod"
          });
          Logger.debug(error, "An error occurred saving the order", cartId, error);
          throw new Meteor.Error("An error occurred saving the order", cartId, error);
        }
      }
    });
  }
});
