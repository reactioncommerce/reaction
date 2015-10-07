// Meteor.after to call after
ReactionCore.MethodHooks.after("cart/submitPayment", function (options) {
  // if cart/submit had an error we won't copy cart to Order
  // and we'll throw an error.
  if (options.error === undefined) {
    let cart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    if (cart) {
      if (cart.items && cart.billing[0].paymentMethod) {
        Meteor.call("cart/copyCartToOrder", cart._id);
      } else {
        throw new Meteor.Error(
          "An error occurred verifing payment method. Failed to save order."
        );
      }
    }
  }
  return options.result;
});
