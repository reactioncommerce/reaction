import { Reaction } from "/client/modules/core";
/**
 * cartPanel events
 *
 * goes to checkout on btn-checkout click
 *
 */
Template.cartPanel.events({
  "click #btn-checkout": function () {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
});
