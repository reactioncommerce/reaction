// Meteor.after to call after
ReactionCore.MethodHooks.after('cart/submitPayment', function(options) {
  if (options.error === undefined) {
    var cart = ReactionCore.Collections.Cart.findOne(options.result);
    if (cart.items && cart.payment.paymentMethod) {
      Meteor.call("copyCartToOrder", cart._id);
    } else {
      throw new Meteor.Error("An error occurred verifing payment method. Failed to save order.");
    }
  }
  return options.result;
});
