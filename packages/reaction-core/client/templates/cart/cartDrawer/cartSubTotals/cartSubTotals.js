/**
 * cartSubTotals helpers
 *
 * @returns cart
 */
Template.cartSubTotals.helpers({
  cart: function() {
    return ReactionCore.Collections.Cart.findOne();
  }
});
