// Meteor.after to call after
ReactionCore.MethodHooks.after('cart/submitPayment', function(options) {
  if (options.error === undefined) {
    var cartId = ReactionCore.Collections.Cart.findOne()._id;
    var order = ReactionCore.Collections.Orders.findOne({'cartId': cartId});
    Meteor.call("copyCartToOrder", cartId);
  }
  return options.result;
});
