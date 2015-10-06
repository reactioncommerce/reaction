/*
 * Template helpers for cart
 *
 */

/**
 * cart template helper
 * @description
 * methods to return cart calculated values
 * cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
 * are calculated by a transformation on the collection
 * and are available to use in template as cart.xxx
 * in template: {{cart.cartCount}}
 * in code: ReactionCore.Collections.Cart.findOne().cartTotal()
 * @return {Object} returns inventory helpers
 */
Template.registerHelper("cart", function () {
  let cartHelpers = {
    /**
     * showCartIconWarning
     * @return {Boolean} return true if low inventory on any item in cart
     */
    showCartIconWarning() {
      if (this.showLowInventoryWarning()) {
        return true;
      }
      return false;
    },
    /**
     * showLowInventoryWarning
     * @return {Boolean} return true if low inventory on any item in cart
     */
    showLowInventoryWarning() {
      let item;
      let storedCart = ReactionCore.Collections.Cart.findOne();
      // we're not being picky here - first thing in cart
      // that is low will trigger a inventory warning
      if (storedCart !== null ? storedCart.items : void 0) {
        for (item of storedCart.items) {
          if (item.variants !== null && item.variants.inventoryPolicy &&
            item.variants.lowInventoryWarningThreshold) {
            if (item.variants.inventoryQuantity <= item.variants.lowInventoryWarningThreshold) {
              return true;
            }
          }
        }
      }
    },
    /**
     * showLowInventoryWarning
     * @param {Object} variant - variant object to check inventory levels on
     * @return {Boolean} return true if low inventory on variant
     */
    showItemLowInventoryWarning(variant) {
      if ((variant !== null ? variant.inventoryPolicy : void 0) && (
          variant !== null ? variant.lowInventoryWarningThreshold :
          void 0
        )) {
        if ((variant !== null ? variant.inventoryQuantity : void 0) <=
          variant.lowInventoryWarningThreshold) {
          return true;
        }
      }
      return false;
    }
  };
  return cartHelpers;
});

/**
 * cartPayerName
 * @summary gets current cart billing address / payment name
 * @return {String} returns cart.billing[0].fullName
 */

Template.registerHelper("cartPayerName", function () {
  let cart = ReactionCore.Collections.Cart.findOne();
  if (cart) {
    if (cart.billing) {
      if (cart.billing[0].address) {
        if (cart.billing[0].address.fullName) {
          return cart.billing[0].address.fullName;
        }
      }
    }
  }
});
