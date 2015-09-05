// Cart Methods
// Client stub.
//

Meteor.methods({
  "cart/submitPayment": function (paymentMethod) {
    check(paymentMethod, Object);
    this.unblock();

    var Cart = ReactionCore.Collections.Cart.findOne();
    var cartId = Cart._id;

    // we won't actually close the order at this stage.
    // we'll just update the workflow where
    // method-hooks can process the workflow update.

    result = ReactionCore.Collections.Cart.update({
      _id: cartId
    }, {
      $addToSet: {
        "payment.paymentMethod": paymentMethod,
        "workflow.workflow": "paymentSubmitted"
      }
    });

    if (result === 1) {
      Router.go("cartCompleted", {
        _id: cartId
      });
    } else {
      Alerts.add("Failed to place order.", "danger", {
        autoHide: true,
        placement: "paymentMethod"
      });
      throw new Meteor.Error("An error occurred saving the order", error);
    }
  }
});
