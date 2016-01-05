// Meteor.after to call after
ReactionCore.MethodHooks.after("cart/submitPayment", function (options) {
  // if cart/submit had an error we won't copy cart to Order
  // and we'll throw an error.
  ReactionCore.Log.debug("MethodHooks after cart/submitPayment", options);
  if (typeof options.error === "undefined") {
    let cart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });
    // update workflow
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow",
      "paymentSubmitted");

    if (cart) {
      if (cart.items && cart.billing[0].paymentMethod) {
        // we need to throw an the session below the `cart/createCart` method
        const sessionId = options.arguments[1];
        Meteor.call("cart/copyCartToOrder", cart._id, sessionId);
      } else {
        throw new Meteor.Error(
          "An error occurred verifing payment method. Failed to save order."
        );
      }
    }
  }
  return options.result;
});
