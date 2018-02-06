import { $ } from "meteor/jquery";
import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";
import { Template } from "meteor/templating";

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
    return $("#cart-drawer-container").fadeOut(300, () => Reaction.toggleSession("displayCart"));
  }
});
