import { Reaction } from "/client/modules/core";
import { Cart } from "/lib/collections";

/**
 * cartIcon helpers
 *
 */
Template.cartIcon.helpers({
  cart() {
    return Cart.findOne();
  }
});

Template.cartIcon.events({
  "click .cart-icon"() {
    return $("#cart-drawer-container").fadeOut(300, function () {
      return Reaction.toggleSession("displayCart");
    });
  }
});
