Meteor.methods({
  /**
   * Description of what this does.
   *
   * @param {String} cartId - cartId
   * @param {Object} paymentMethod - formatted payment method object
   * @returns {boolean} boolean
   */
  "payments/paymentMethod": (cartId, paymentMethod) => {
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
