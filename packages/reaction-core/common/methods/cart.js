//
// Common Cart Methods
// Shared client/server methods.
//
Meteor.methods({
  /**
   * cart/removeFromCart
   * @memberOf Core Common
   * @summary removes or adjust quantity of a variant from the cart
   * @param {String} cartId - user cartId
   * @param {Object} cartItem - cart item object ReactionCore.Schemas.CartItem
   * @param {Number} quantity - optional, if provided will adjust increment by quantity
   * @returns {String} returns Mongo update result
   */
  "cart/removeFromCart": function (cartId, cartItem, quantity) {
    check(cartId, String);
    check(cartItem, ReactionCore.Schemas.CartItem);
    check(quantity, Match.Optional(Number));

    this.unblock();

    if (!quantity) {
      return ReactionCore.Collections.Cart.update({
        _id: cartId
      }, {
        $pull: {
          items: {
            variants: cartItem.variants
          }
        }
      }, function (error, result) {
        if (error) {
          ReactionCore.Log.warn("error removing from cart", ReactionCore.Collections
            .Cart.simpleSchema().namedContext().invalidKeys());
          return error;
        }
        ReactionCore.Log.info(`cart: deleted cart item variant id ${cartItem.variants._id}`);
        return result;
      });
    }
    // if quantity lets convert to negative and increment
    let removeQuantity = Math.abs(quantity) * -1;
    return ReactionCore.Collections.Cart.update({
      _id: cartId,
      items: cartItem
    }, {
      $inc: {
        "items.quantity": removeQuantity
      }
    }, function (error, result) {
      if (error) {
        ReactionCore.Log.warn("error removing from cart", ReactionCore.Collections
          .Cart.simpleSchema().namedContext().invalidKeys());
        return error;
      }
      ReactionCore.Log.info(`cart: removed variant ${cartItem._id} quantity of ${quantity}`);
      return result;
    });
  }
});
//
// Client Cart Methods
// Stubs with matching server methods.
//
if (Meteor.isClient) {
  Meteor.methods({
    "cart/submitPayment": function (paymentMethod) {
      check(paymentMethod, ReactionCore.Schemas.PaymentMethod);

      let checkoutCart = ReactionCore.Collections.Cart.findOne({
        userId: Meteor.userId()
      });

      let cart = _.clone(checkoutCart);
      let cartId = cart._id;
      let invoice = {
        shipping: cart.cartShipping(),
        subtotal: cart.cartSubTotal(),
        taxes: cart.cartTaxes(),
        discounts: cart.cartDiscounts(),
        total: cart.cartTotal()
      };
      // we won't actually close the order at this stage.
      // we'll just update the workflow and billing data where
      // method-hooks can process the workflow update.

      let selector;
      let update;
      // temp hack until we build out multiple billing handlers
      // if we have an existing item update it, otherwise add to set.
      if (cart.billing) {
        selector = {
          "_id": cartId,
          "billing._id": cart.billing[0]._id
        };
        update = {
          $set: {
            "billing.$.paymentMethod": paymentMethod,
            "billing.$.invoice": invoice
          }
        };
      } else {
        selector = {
          _id: cartId
        };
        update = {
          $addToSet: {
            "billing.paymentMethod": paymentMethod,
            "billing.invoice": invoice
          }
        };
      }

      ReactionCore.Collections.Cart.update(selector, update, function (
        error, result) {
        if (error) {
          ReactionCore.Log.warn(error);
          throw new Meteor.Error("An error occurred saving the order",
            error);
        } else {
          // it's ok for this to be called multiple times
          Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow",
            "paymentSubmitted");
          // Client Stub Actions
          if (result === 1) {
            Router.go("cartCompleted", {
              _id: cartId
            });
          } else {
            Alerts.add("Failed to place order.", "danger", {
              autoHide: true,
              placement: "paymentMethod"
            });
            throw new Meteor.Error(
              "An error occurred saving the order", cartId,
              error);
          }
        }
      });
    }
  });
}
