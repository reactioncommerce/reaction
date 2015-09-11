
/**
* Template helpers for cart
*
* methods to return cart calculated values
* cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
* are calculated by a transformation on the collection
* and are available to use in template as cart.xxx
* in template: {{cart.cartCount}}
* in code: ReactionCore.Collections.Cart.findOne().cartTotal()
*/

Template.registerHelper("cart", function() {
  return {
    showCartIconWarning: function() {
      if (this.showLowInventoryWarning()) {
        return true;
      }
      return false;
    },
    showLowInventoryWarning: function() {
      var item, storedCart, _i, _len, _ref, _ref1, _ref2, _ref3;
      storedCart = Cart.findOne();
      if (storedCart != null ? storedCart.items : void 0) {
        _ref = storedCart != null ? storedCart.items : void 0;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (((_ref1 = item.variants) != null ? _ref1.inventoryPolicy : void 0) && ((_ref2 = item.variants) != null ? _ref2.lowInventoryWarningThreshold : void 0)) {
            if (((_ref3 = item.variants) != null ? _ref3.inventoryQuantity : void 0) <= item.variants.lowInventoryWarningThreshold) {
              return true;
            }
          }
        }
      }
      return false;
    },
    showItemLowInventoryWarning: function(variant) {
      if ((variant != null ? variant.inventoryPolicy : void 0) && (variant != null ? variant.lowInventoryWarningThreshold : void 0)) {
        if ((variant != null ? variant.inventoryQuantity : void 0) <= variant.lowInventoryWarningThreshold) {
          return true;
        }
      }
      return false;
    }
  };
});


/**
 * cartPayerName
 * gets current cart billing address / payment name
 */

Template.registerHelper("cartPayerName", function() {
  var _ref, _ref1, _ref2;
  return (_ref = Cart.findOne()) != null ? (_ref1 = _ref.payment) != null ? (_ref2 = _ref1.address) != null ? _ref2.fullName : void 0 : void 0 : void 0;
});
