import { Template } from "meteor/templating";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

/**
 * @method cart
 * @summary methods to return cart calculated values
 * cartCount, cartSubTotal, cartShipping, cartTaxes, `cartTotal`
 * are calculated by a transformation on the collection
 * and are available to use in template as cart.xxx
 * @example {{cart.getCount}}
 * @memberof BlazeTemplateHelpers
 * @return {Object} returns inventory helpers
 */
Template.registerHelper("cart", () => {
  const cartHelpers = {
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
 * @method cartPayerName
 * @memberof BlazeTemplateHelpers
 * @summary gets current cart billing address / payment name
 * @example {{>afFieldInput name="payerName" value=cartPayerName}}
 * @return {String} returns cart.billing[0].fullName
 */
Template.registerHelper("cartPayerName", () => {
  const { cart } = getCart();
  if (cart && cart.billing && cart.billing[0] && cart.billing[0].address && cart.billing[0].address.fullName) {
    const name = cart.billing[0].address.fullName;
    if (name.replace(/[a-zA-Z ]*/, "").length === 0) return name;
  }
});
