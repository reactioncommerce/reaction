import accounting from "accounting-js";
import _ from "lodash";
import { Shops } from "/lib/collections";

/**
 * getSummary
 * @private
 * @summary iterates over cart items with computations
 * @param {Array} items - cart.items array
 * @param {Array} prop - path to item property represented by array
 * @param {Array} [prop2] - path to another item property represented by array
 * @param {String} [shopId] - shopId
 * @returns {Number} - computations result
 */
function getSummary(items, prop, prop2, shopId) {
  try {
    if (Array.isArray(items)) {
      return items.reduce((sum, item) => {
        if (prop2) {
          if (shopId) {
            if (shopId === item.shopId) {
              // if we're looking for a specific shop's items and this item does match
              // if prop2 is an empty array
              if (!prop2.length) {
                return sum + (prop.length === 1 ? item[prop[0]] :
                  item[prop[0]][prop[1]]);
              }
              return sum + item[prop[0]] * (prop2.length === 1 ? item[prop2[0]] :
                item[prop2[0]][prop2[1]]);
            }
            // If we're looking for a specific shop's items and this item doesn't match
            return sum;
          }
          // No shopId param
          // S + a * b, where b could be b1 or b2
          return sum + item[prop[0]] * (prop2.length === 1 ? item[prop2[0]] :
            item[prop2[0]][prop2[1]]);
        }
        // No prop2 param
        // S + b, where b could be b1 or b2
        return sum + (prop.length === 1 ? item[prop[0]] :
          item[prop[0]][prop[1]]);
      }, 0);
    }
  } catch (error) {
    // If data not prepared we should send a number to avoid exception with
    // `toFixed`. This could happens if user stuck on `completed` checkout stage
    // by some reason.
    return 0;
  }
  return 0;
}

/**
 * Reaction transform methods on Collections
 * @file Use transform methods to return Cart and Order calculated values: count, subTotal, shipping, taxes, total.
 * Use these methods on Cart and Orders in templates, `{{cart.getCount}}` and in code, `Cart.findOne().getTotal()`.
 * These use Meteor Collection {@link http://docs.meteor.com/api/collections.html#Mongo-Collection transforms}.
 * @module cartOrderTransform
 */

export const cartOrderTransform = {
  /**
   * @summary Return the total quantity on the order
   * @method getCount
   * @example {cart ? cart.getCount() : 0}
   * @returns {Number}  Total quantity of items on the order
   */
  getCount() {
    return getSummary(this.items, ["quantity"]);
  },
  /**
   * @summary Return the total price of shipping/handling on the order
   * @method getShippingTotal
   * @returns {Number} Total price of shipping/handling on the order
   */
  getShippingTotal() {
    // loop through the cart.shipping, sum shipments.
    const rate = getSummary(this.shipping, ["shipmentMethod", "rate"]);
    const handling = getSummary(this.shipping, ["shipmentMethod", "handling"]);
    const shipping = handling + rate || 0;
    return accounting.toFixed(shipping, 2);
  },
  /**
   * @summary Get the total price of shipping, broken down by shop
   * @method getShippingTotalByShop
   * @returns {{Object}} - Total price of shipping, broken down by shop
   */
  getShippingTotalByShop() {
    return this.shipping.reduce((uniqueShopShippingTotals, shippingRec) => {
      if (!uniqueShopShippingTotals[shippingRec.shopId]) {
        const rate = getSummary(this.shipping, ["shipmentMethod", "rate"], [], shippingRec.shopId);
        const handling = getSummary(this.shipping, ["shipmentMethod", "handling"], [], shippingRec.shopId);
        const shipping = handling + rate || 0;
        uniqueShopShippingTotals[shippingRec.shopId] = accounting.toFixed(shipping, 2);
        return uniqueShopShippingTotals;
      }
      return uniqueShopShippingTotals;
    }, {});
  },
  /**
   * @summary Return the total price of goods on an order
   * @method getSubTotal
   * @returns {Number} Total price of goods for the order
   */
  getSubTotal() {
    const subTotal = getSummary(this.items, ["quantity"], ["price", "amount"]);
    return accounting.toFixed(subTotal, 2);
  },
  /**
   * @summary Aggregates the subtotals by shopId
   * @method getSubtotalByShop
   * @returns {Object} Object with a key for each shopId in the cart/order where the value is the subtotal for that shop
   */
  getSubtotalByShop() {
    return this.items.reduce((uniqueShopSubTotals, item) => {
      if (!uniqueShopSubTotals[item.shopId]) {
        const subTotal = getSummary(this.items, ["quantity"], ["price", "amount"], item.shopId);
        uniqueShopSubTotals[item.shopId] = accounting.toFixed(subTotal, 2);
        return uniqueShopSubTotals;
      }
      return uniqueShopSubTotals;
    }, {});
  },
  /**
   * @summary Discount for cart/order.
   * @description Grabs discounts from the invoice records if they exist, otherwise from this.discounts
   * @example const cartDiscounts = cart.getDiscounts();
   * @method getDiscounts
   * @returns {Number} Total value of discounts
   */
  getDiscounts() {
    let orderDiscounts = 0;
    orderDiscounts = (this.billing || []).reduce((acc, item) => {
      if (item.invoice && item.invoice.discounts) {
        return acc + item.invoice.discounts;
      }
      return acc;
    }, 0);
    const cartDiscount = this.discount || 0;
    const discount = orderDiscounts || cartDiscount || 0;
    return accounting.toFixed(discount, 2);
  },
  /**
   * @summary Return an array of payment methods for display removing duplicates
   * @method getUniquePaymentMethods
   * @returns {Object} - An object containing the payment methods used on this order excluding duplicates
   */
  getUniquePaymentMethods() {
    const uniqueMethods = {};
    for (const payment of this.payments) {
      const { cardBrand, displayName, method, processor } = payment || {};
      const key = `${displayName}${processor}${method}`;
      if (!uniqueMethods[key]) {
        uniqueMethods[key] = { cardBrand, displayName, key, method, processor };
      }
    }
    const uniqueValueArray = _.values(uniqueMethods);
    return uniqueValueArray;
  },
  /**
   * @summary Create an object that contains a summary for each shop
   * @method getShopSummary
   * @returns {Object}  An object with a key for each shopId, and name + summary data for each
   */
  getShopSummary() {
    // massage items into an object by Shop
    const subTotalsByShop = this.getSubtotalByShop();
    const shippingByShop = this.getShippingTotalByShop();
    const { shipping } = this;
    const itemsByShop = this.items.reduce((shopItems, item) => {
      if (!shopItems[item.shopId]) {
        shopItems[item.shopId] = [item];
      } else {
        shopItems[item.shopId].push(item);
      }
      return shopItems;
    }, {});

    const shopObjects = Object.keys(itemsByShop).map((shop) => ({
      [shop]: {
        name: Shops.findOne(shop).name,
        subTotal: subTotalsByShop[shop],
        taxes: itemsByShop[shop].reduce((sum, item) => (sum + (item.tax || 0)), 0),
        items: itemsByShop[shop],
        quantityTotal: itemsByShop[shop].reduce((sum, item) => sum + item.quantity, 0),
        shipping: shippingByShop[shop],
        shippingMethod: shipping[0].shipmentMethod
      }
    }));
    // TODO we just assume now that every shop uses the same carrier, thus the hard-coded zero index
    // because shipping records are not stored by shop
    const sortedShopObjects = _.sortBy(shopObjects, (shopObject) => shopObject.name);
    return sortedShopObjects;
  }
};
