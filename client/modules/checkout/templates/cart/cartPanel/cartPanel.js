import { ReactionRouter } from "/client/modules/router";
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
    return ReactionRouter.go("cart/checkout");
  }
});
