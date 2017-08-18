import accounting from "accounting-js";

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
 * transform methods used to return cart and order calculated values
 * count, subTotal, shipping, taxes, total
 * are calculated by a transformation on the collection
 * and are available to use in template as cart.xxx or order.xxx
 * in template: {{cart.count}}
 * in code: Cart.findOne().total()
 */
export const cartOrderTransform = {
  count() {
    return getSummary(this.items, ["quantity"]);
  },
  shipping() {
    // loop through the cart.shipping, sum shipments.
    const rate = getSummary(this.shipping, ["shipmentMethod", "rate"]);
    const handling = getSummary(this.shipping, ["shipmentMethod", "handling"]);
    const shipping = handling + rate || 0;
    return accounting.toFixed(shipping, 2);
  },
  subTotal() {
    const subTotal = getSummary(this.items, ["quantity"], ["variants", "price"]);
    return accounting.toFixed(subTotal, 2);
  },
  taxes() {
    // taxes are calculated in a Cart.after.update hooks
    // the tax value stored with the cart is the effective tax rate
    // calculated by line items
    // in the imports/core/taxes plugin
    const tax = this.tax || 0;
    const subTotal = parseFloat(this.subTotal());
    const taxTotal = subTotal * tax;
    return accounting.toFixed(taxTotal, 2);
  },
  discounts() {
    const discount = this.discount || 0;
    return accounting.toFixed(discount, 2);
  },
  total() {
    const subTotal = parseFloat(this.subTotal());
    const shipping = parseFloat(this.shipping());
    const taxes = parseFloat(this.taxes());
    const discount = parseFloat(this.discounts());
    const discountTotal = Math.max(0, subTotal - discount);
    const total = discountTotal + shipping + taxes;
    return accounting.toFixed(total, 2);
  }
};
