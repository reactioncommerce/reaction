import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";
import { Logger, MethodHooks } from "/server/api";
// this needed to keep correct loading order. Methods should be loaded before hooks
import "../cart";

// // Meteor.after to call after
MethodHooks.after("cart/submitPayment", (options) => {
  // TODO: REVIEW WITH AARON - this is too late to fail. We need to copy cart to order either way at this point
  // if cart/submit had an error we won't copy cart to Order
  // and we'll throw an error.
  Logger.debug("MethodHooks after cart/submitPayment", options);
  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  const result = options.result || {};
  if (typeof options.error === "undefined") {
    const cart = Cart.findOne({
      userId: Meteor.userId()
    });

    // update workflow
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "paymentSubmitted");

    // create order
    if (cart) {
      if (!cart.billing) {
        Logger.debug("MethodHooks after cart/submitPayment. No billing address after payment! userId:", Meteor.userId(), "options:", options);
      }

      if (cart.items && cart.billing && cart.billing[0].paymentMethod) {
        const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
        // Return orderId as result from this after hook call.
        // This is done by extending the existing result.
        result.orderId = orderId;
      } else {
        throw new Meteor.Error(
          "server-error",
          "An error occurred verifing payment method. Failed to save order."
        );
      }
    }
  } else {
    throw new Meteor.Error("Error after submitting payment", options.error);
  }
  return result;
});
