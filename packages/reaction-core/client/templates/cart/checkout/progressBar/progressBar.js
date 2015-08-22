/**
* checkoutProgressBar helpers
* progressbar status: "visited first","previous visited","active","next"
*/

Template.checkoutProgressBar.helpers({
  loginStatus: function() {
    if (getGuestLoginState()) {
      return "previous visited";
    } else {
      return "active";
    }
  },
  shippingStatus: function() {
    var cart, _ref, _ref1;
    cart = Cart.findOne();
    if (getGuestLoginState() && (cart != null ? (_ref = cart.shipping) != null ? _ref.address : void 0 : void 0) && (cart != null ? (_ref1 = cart.payment) != null ? _ref1.address : void 0 : void 0)) {
      return "previous visited";
    } else if (getGuestLoginState()) {
      return "active";
    }
  },
  shippingOptionStatus: function() {
    var cart, shipmentMethod, _ref, _ref1, _ref2, _ref3, _ref4;
    cart = Cart.findOne();
    shipmentMethod = cart != null ? (_ref = cart.shipping) != null ? _ref.shipmentMethod : void 0 : void 0;
    if ((cart != null ? (_ref1 = cart.shipping) != null ? _ref1.address : void 0 : void 0) && (cart != null ? (_ref2 = cart.payment) != null ? _ref2.address : void 0 : void 0)) {
      if (getGuestLoginState() && shipmentMethod) {
        return "previous visited";
      } else if (getGuestLoginState() && (cart != null ? (_ref3 = cart.shipping) != null ? _ref3.address : void 0 : void 0) && (cart != null ? (_ref4 = cart.payment) != null ? _ref4.address : void 0 : void 0)) {
        return "active";
      }
    }
  },
  reviewStatus: function() {
    var cart, shipmentMethod, _ref, _ref1;
    cart = Cart.findOne();
    shipmentMethod = cart != null ? (_ref = cart.shipping) != null ? _ref.shipmentMethod : void 0 : void 0;
    if (getGuestLoginState() && shipmentMethod && (cart != null ? (_ref1 = cart.payment) != null ? _ref1.address : void 0 : void 0)) {
      return "previous visited";
    }
  },
  completeStatus: function() {
    var cart, shipmentMethod, _ref, _ref1;
    cart = Cart.findOne();
    shipmentMethod = cart != null ? (_ref = cart.shipping) != null ? _ref.shipmentMethod : void 0 : void 0;
    if (getGuestLoginState() && shipmentMethod && (cart != null ? (_ref1 = cart.payment) != null ? _ref1.address : void 0 : void 0)) {
      return "active";
    }
  }
});
