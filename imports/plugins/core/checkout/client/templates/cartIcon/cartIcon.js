import { $ } from "meteor/jquery";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

/**
 * cartIcon helpers
 *
 */
Template.cartIcon.helpers({
  cart() {
    const { cart } = getCart();
    return cart;
  }
});

Template.cartIcon.events({
  "click .cart-icon"() {
    return $("#cart-drawer-container").fadeOut(300, () => Reaction.toggleSession("displayCart"));
  }
});
