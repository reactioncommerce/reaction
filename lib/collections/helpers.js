/**
 * getSummary
 * @summary iterates over cart items with computations
 * @param {Array} items - cart.items array
 * @param {Array} prop - path to item property represented by array
 * @param {Array} [prop2] - path to another item property represented by array
 * @return {Number} - computations result
 */
function getSummary(items, prop, prop2) {
  try {
    if (Array.isArray(items)) {
      return items.reduce((sum, item) => {
        if (prop2) {
          // S + a * b, where b could be b1 or b2
          return sum + item[prop[0]] * (prop2.length === 1 ? item[prop2[0]] :
            item[prop2[0]][prop2[1]]);
        }
        // S + b, where b could be b1 or b2
        return sum + (prop.length === 1 ? item[prop[0]] :
          item[prop[0]][prop[1]]);
      }, 0);
    }
  } catch (e) {
    // If data not prepared we should send a number to avoid exception with
    // `toFixed`. This could happens if user stuck on `completed` checkout stage
    // by some reason.
    return 0;
  }
  return 0;
}

/**
* Reaction transform collections
*
* transform methods used to return cart calculated values
* cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
* are calculated by a transformation on the collection
* and are available to use in template as cart.xxx
* in template: {{cart.cartCount}}
* in code: Cart.findOne().cartTotal()
*/
export const cartTransform = {
  cartCount() {
    return getSummary(this.items, ["quantity"]);
  },
  cartShipping() {
    // loop through the cart.shipping, sum shipments.
    return parseFloat(getSummary(this.shipping, ["shipmentMethod", "rate"]));
  },
  cartSubTotal() {
    return getSummary(this.items, ["quantity"], ["variants", "price"]).
      toFixed(2);
  },
  cartTaxes() {
    const tax = this.tax || 0;
    return (getSummary(this.items, ["variants", "price"]) * tax).toFixed(2);
  },
  cartDiscounts() {
    return "0.00";
  },
  cartTotal() {
    let subTotal = getSummary(this.items, ["quantity"], ["variants", "price"]);
    // loop through the cart.shipping, sum shipments.
    let shippingTotal = getSummary(this.shipping, ["shipmentMethod", "rate"]);
    shippingTotal = parseFloat(shippingTotal);
    // TODO: includes taxes?
    if (typeof shippingTotal === "number" && shippingTotal > 0) {
      subTotal += shippingTotal;
    }
    return subTotal.toFixed(2);
  }
};
