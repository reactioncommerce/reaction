/**
 * cartSubTotals helpers
 *
 * @returns cart
 */
Template.cartSubTotals.helpers({
  cart: function() {
    return Cart.findOne();
  }
});
