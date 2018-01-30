import { Cart } from "/lib/collections";
import { Template } from "meteor/templating";

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
 * in template: {{cart.getCount}}
 * in code: Cart.findOne().getTotal()
 * @return {Object} returns inventory helpers
 */
Template.registerHelper("cart", () => {
  const cartHelpers = {
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
      const storedCart = Cart.findOne();
      // we're not being picky here - first thing in cart
      // that is low will trigger a inventory warning
      if (storedCart && storedCart.items) {
        for (item of storedCart.items) {
          if (item.variants && item.variants.inventoryPolicy &&
            item.variants.lowInventoryWarningThreshold) {
            return item.variants.inventoryQuantity <=
              item.variants.lowInventoryWarningThreshold;
          }
        }
      }
      return false;
    },
    /**
     * showLowInventoryWarning
     * @param {Object} variant - variant object to check inventory levels on
     * @return {Boolean} return true if low inventory on variant
     */
    showItemLowInventoryWarning(variant) {
      if (variant && variant.inventoryPolicy &&
        variant.lowInventoryWarningThreshold) {
        return variant.inventoryQuantity <=
          variant.lowInventoryWarningThreshold;
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
Template.registerHelper("cartPayerName", () => {
  const cart = Cart.findOne();
  if (cart && cart.billing && cart.billing[0] && cart.billing[0].address && cart.billing[0].address.fullName) {
    const name = cart.billing[0].address.fullName;
    if (name.replace(/[a-zA-Z ]*/, "").length === 0) return name;
  }
});
