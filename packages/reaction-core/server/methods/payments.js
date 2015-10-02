Meteor.methods({
  /**
   * payments/paymentMethod
   * @summary adds payment to order
   * @param {String} cartId - cartId
   * @param {Object} paymentMethod - formatted payment method object
   * @returns {String} return cart update result
   */
  "payments/paymentMethod": function (cartId, paymentMethod) {
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
