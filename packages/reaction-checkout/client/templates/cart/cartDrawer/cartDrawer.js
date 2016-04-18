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

    let storedCart = ReactionCore.Collections.Cart.findOne();
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
    return ReactionCore.Collections.Cart.findOne().items;
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
    return ReactionRouter.go("cart/checkout");
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
      return toggleSession("displayCart");
    });
  }
});

Template.emptyCartDrawer.onRendered(function () {
  return $("#cart-drawer-container").fadeIn();
});
