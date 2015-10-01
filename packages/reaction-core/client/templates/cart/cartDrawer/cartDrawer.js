/**
 * cartDrawer helpers
 *
 * @provides displayCartDrawer
 * @returns  open or closed cart drawer template
 */

Template.cartDrawer.helpers({
  displayCartDrawer: function() {
    var count, items, storedCart, _i, _len, _ref;
    if (!Session.equals("displayCart", true)) {
      return null;
    }
    storedCart = Cart.findOne();
    count = 0;
    if (storedCart != null ? storedCart.items : void 0) {
      _ref = storedCart.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        items = _ref[_i];
        count += items.quantity;
      }
    }
    if (count === 0) {
      return Template.emptyCartDrawer;
    } else {
      return Template.openCartDrawer;
    }
  }
});

/**
 * openCartDrawer helpers
 *
 */
Template.openCartDrawer.onRendered(function() {
  return $('#cart-drawer-container').fadeIn();
});

Template.openCartDrawer.helpers({
  cartItems: function() {
    return Cart.findOne().items;
  },
  checkoutView: function() {
    var checkoutView;
    checkoutView = "display:block";
    if (Router.current().route.getName() === 'cartCheckout') {
      return checkoutView;
    }
  }
});

/**
 * openCartDrawer events
 *
 */
Template.openCartDrawer.events({
  'click #btn-checkout': function(event, template) {
    $('#cart-drawer-container').fadeOut();
    Session.set("displayCart", false);
    return Router.go("cartCheckout");
  },
  'click .remove-cart-item': function(event, template) {
    event.stopPropagation();
    event.preventDefault();
    var currentCartId = Cart.findOne()._id;
    var currentVariant = this.variants;

    return $(event.currentTarget).fadeOut(300, function() {
      return Meteor.call('cart/removeFromCart', currentCartId, currentVariant);
    });
  }
});

/**
 * emptyCartDrawer helpers
 *
 */
Template.emptyCartDrawer.events({
  'click #btn-keep-shopping': function(event, template) {
    event.stopPropagation();
    event.preventDefault();
    return $('#cart-drawer-container').fadeOut(300, function() {
      return toggleSession("displayCart");
    });
  }
});

Template.emptyCartDrawer.onRendered(function() {
  return $('#cart-drawer-container').fadeIn();
});
