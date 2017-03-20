import accounting from "accounting-js";


// TODO: This is a duplicate of the cart transform with just the names changed.
// This should be factored to be just one file for both

/**
 * getSummary
 * @summary iterates over order items with computations
 * @param {Array} items - order.items array
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
 * transform methods used to return order calculated values
 * orderCount, orderSubTotal, orderShipping, orderTaxes, orderTotal
 * are calculated by a transformation on the collection
 * and are available to use in template as order.xxx
 * in template: {{order.orderCount}}
 * in code: order.findOne().orderTotal()
 */
export const orderTransform = {
  orderCount() {
    return getSummary(this.items, ["quantity"]);
  },
  orderShipping() {
    // loop through the order.shipping, sum shipments.
    const rate = getSummary(this.shipping, ["shipmentMethod", "rate"]);
    const handling = getSummary(this.shipping, ["shipmentMethod", "handling"]);
    const shipping = handling + rate || 0;
    return accounting.toFixed(shipping, 2);
  },
  orderSubTotal() {
    const subTotal = getSummary(this.items, ["quantity"], ["variants", "price"]);
    return accounting.toFixed(subTotal, 2);
  },
  orderTaxes() {
    // taxes are calculated in a order.after.update hooks
    // the tax value stored with the order is the effective tax rate
    // calculated by line items
    // in the imports/core/taxes plugin
    const tax = this.tax || 0;
    const subTotal = parseFloat(this.orderSubTotal());
    const taxTotal = subTotal * tax;
    return accounting.toFixed(taxTotal, 2);
  },
  orderDiscounts() {
    const discount = this.discount || 0;
    return accounting.toFixed(discount, 2);
  },
  orderTotal() {
    const subTotal = parseFloat(this.orderSubTotal());
    const shipping = parseFloat(this.orderShipping());
    const taxes = parseFloat(this.orderTaxes());
    const discount = parseFloat(this.orderDiscounts());
    const discountTotal = Math.max(0, subTotal - discount);
    const total = discountTotal + shipping + taxes;
    return accounting.toFixed(total, 2);
  },
  itemCount() {
    let count = 0;
    if (Array.isArray(this.items)) {
      for (const item of this.items) {
        count += item.quantity;
      }
    }
    return count;
  }
};

