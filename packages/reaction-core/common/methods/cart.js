// Cart Methods
// Client stub.
//


Meteor.methods({
  "cart/submitPayment": function (paymentMethod) {
    check(paymentMethod, Object);

    var checkoutCart = ReactionCore.Collections.Cart.findOne({
      'userId': Meteor.userId()
    });

    var cart = _.clone(checkoutCart);
    var cartId = cart._id;
    var invoice = {
      shipping: cart.cartShipping(),
      subtotal: cart.cartSubTotal(),
      taxes: cart.cartTaxes(),
      discounts: cart.cartDiscounts(),
      total: cart.cartTotal()
    };

    // we won't actually close the order at this stage.
    // we'll just update the workflow where
    // method-hooks can process the workflow update.

    result = ReactionCore.Collections.Cart.update({
      _id: cartId
    }, {
      $addToSet: {
        "payment.paymentMethod": paymentMethod,
        "payment.invoices": invoice,
        "workflow.workflow": "paymentSubmitted"
      }
    });

    var updatedCart = ReactionCore.Collections.Cart.findOne({
      'userId': Meteor.userId()
    });

    // Client Stub Actions
    if (result === 1 && updatedCart.payment && updatedCart.items) {
      Router.go("cartCompleted", {
        _id: cartId
      });
    } else {
      Alerts.add("Failed to place order.", "danger", {
        autoHide: true,
        placement: "paymentMethod"
      });
      throw new Meteor.Error("An error occurred saving the order", cartId, error);
    }
  }
});
