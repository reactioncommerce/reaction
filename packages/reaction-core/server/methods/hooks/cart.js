// Meteor.after to call after
ReactionCore.MethodHooks.after("cart/submitPayment", function (options) {
  if (options.error === undefined) {
    let cart = ReactionCore.Collections.Cart.findOne(options.result);
    if (cart.items && cart.billing[0].paymentMethod) {
      Meteor.call("cart/copyCartToOrder", cart._id);
    } else {
      throw new Meteor.Error(
        "An error occurred verifing payment method. Failed to save order."
      );
    }
  }
  return options.result;
});
