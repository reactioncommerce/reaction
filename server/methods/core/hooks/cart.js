// Meteor.after to call after
ReactionCore.MethodHooks.after("cart/submitPayment", function (options) {
  // if cart/submit had an error we won't copy cart to Order
  // and we'll throw an error.
  ReactionCore.Log.debug("MethodHooks after cart/submitPayment", options);
  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  let result = options.result || {};
  if (typeof options.error === "undefined") {
    let cart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });
    // update workflow
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow",
      "paymentSubmitted");

    if (cart) {
      if (cart.items && cart.billing[0].paymentMethod) {
        const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
        // Return orderId as result from this after hook call.
        // This is done by extending the existing result.
        result.orderId = orderId;
      } else {
        throw new Meteor.Error(
          "An error occurred verifing payment method. Failed to save order."
        );
      }
    }
  }
  return result;
});
