import { Cart } from "/lib/collections";

/**
 * cartSubTotals helpers
 *
 * @returns cart
 */
Template.cartSubTotals.helpers({
  cart() {
    return Cart.findOne();
  }
});
