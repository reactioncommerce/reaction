import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

/**
 * cartDrawer helpers
 *
 * @provides displayCartDrawer
 * @returns  open or closed cart drawer template
 */

Template.cartDrawer.helpers({
  displayCartDrawer: function () {
    if (!Session.equals("displayCart", true)) {
      return null;
    }

    let storedCart = Cart.findOne();
    let count = 0;

    if (typeof storedCart === "object" && storedCart.items) {
      for (let items of storedCart.items) {
        count += items.quantity;
      }
    }

    if (count === 0) {
      return Template.emptyCartDrawer;
    }
    return Template.openCartDrawer;
  }
});

/**
 * openCartDrawer helpers
 *
 */
Template.openCartDrawer.onRendered(function () {
  return $("#cart-drawer-container").fadeIn();
});

Template.openCartDrawer.helpers({
  cartItems: function () {
    return Cart.findOne().items;
  }
});

/**
 * openCartDrawer events
 *
 */
Template.openCartDrawer.events({
  "click #btn-checkout": function () {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  },
  "click .remove-cart-item": function (event) {
    event.stopPropagation();
    event.preventDefault();
    const currentCartItemId = this._id;

    return $(event.currentTarget).fadeOut(300, function () {
      return Meteor.call("cart/removeFromCart", currentCartItemId);
    });
  }
});

/**
 * emptyCartDrawer helpers
 *
 */
Template.emptyCartDrawer.events({
  "click #btn-keep-shopping": function (event) {
    event.stopPropagation();
    event.preventDefault();
    return $("#cart-drawer-container").fadeOut(300, function () {
      return Reaction.toggleSession("displayCart");
    });
  }
});

Template.emptyCartDrawer.onRendered(function () {
  return $("#cart-drawer-container").fadeIn();
});
