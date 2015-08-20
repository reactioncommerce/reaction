

// Cart Methods
Meteor.methods({

  "cart/processPayment": function (paymentMethod) {
    check(paymentMethod, Object);

    // before payment really should be async
    var cartId = Cart.findOne()._id

    // Step 1: Set the payment method
    Meteor.call("paymentMethod", cartId, paymentMethod, function (error, result) {

      if (error) {
        throw new Meteor.Error("An error occurred saving the payment method", error);
        return;
      }

      // Step 2: Complete the order
      Meteor.call("copyCartToOrder", cartId, function (error, result) {
        // Original order ID
        var orderId = result;

        if (error) {
          throw new Meteor.Error("An error occurred saving the order", error);
          return;
        }

        // FINISH: Route the client to the order completion page
        if (Meteor.isClient) {
          Router.go("cartCompleted", {
            _id: orderId
          });
        }

      }); // END: step 2

    }); // END: step 1

  }

});
