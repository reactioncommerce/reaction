import { Reaction } from "/client/api";
import { Session } from "meteor/session";

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
