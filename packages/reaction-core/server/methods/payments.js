Meteor.methods( {
  /**
   * add payment method
   */
  paymentMethod: function(cartId, paymentMethod) {
    check(cartId, String);
    check(paymentMethod, Object);
    return Cart.update({
      _id: cartId
    }, {
      $addToSet: {
        "payment.paymentMethod": paymentMethod
      }
    });
  }

});
