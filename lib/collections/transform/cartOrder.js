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
 * @return {Number} - computations result
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
  } catch (e) {
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
    const subTotal = getSummary(this.items, ["quantity"], ["variants", "price"]);
    return accounting.toFixed(subTotal, 2);
  },
  /**
   * @summary Aggregates the subtotals by shopId
   * @method getSubtotalByShop
   * @return {object} Object with a key for each shopId in the cart/order where the value is the subtotal for that shop
   */
  getSubtotalByShop() {
    return this.items.reduce((uniqueShopSubTotals, item) => {
      if (!uniqueShopSubTotals[item.shopId]) {
        const subTotal = getSummary(this.items, ["quantity"], ["variants", "price"], item.shopId);
        uniqueShopSubTotals[item.shopId] = accounting.toFixed(subTotal, 2);
        return uniqueShopSubTotals;
      }
      return uniqueShopSubTotals;
    }, {});
  },
  /**
   * @summary Total taxes for order
   * @method getTaxTotal
   * @returns {Number} Total price of taxes for an order
   */
  getTaxTotal() {
    // taxes are calculated in a Cart.after.update hooks
    // the tax value stored with the cart/order is the effective tax rate
    // calculated by line items
    // in the imports/core/taxes plugin
    const tax = this.tax || 0;
    const subTotal = parseFloat(this.getSubTotal());
    const taxTotal = subTotal * tax;
    return accounting.toFixed(taxTotal, 2);
  },
  /**
   * @summary Aggregates the taxes by shopId
   * @method getTaxesByShop
   * @return {Object} Object with a key for each shopId in cart/order where the value is the tax total for that shop
   */
  getTaxesByShop() {
    const subtotals = this.getSubtotalByShop();
    const taxRates = this.taxRatesByShop;

    return Object.keys(subtotals).reduce((shopTaxTotals, shopId) => {
      if (!shopTaxTotals[shopId]) {
        const shopSubtotal = parseFloat(subtotals[shopId]);
        // In case of taxAPI's tax rate is stored in tax.
        const shopTaxRate = (taxRates && taxRates[shopId]) || this.tax || 0;
        const shopTaxTotal = shopSubtotal * shopTaxRate;
        shopTaxTotals[shopId] = accounting.toFixed(shopTaxTotal, 2);
      }
      return shopTaxTotals;
    }, {});
  },
  /**
   * @summary Discount for cart/order.
   * @description Grabs discounts from the invoice records if they exist, otherwise from this.discounts
   * @example const cartTaxesByShop = cart.getTaxesByShop();
   * @method getDiscounts
   * @return {Number} Total value of discounts
   */
  getDiscounts() {
    let orderDiscounts = 0;
    orderDiscounts = this.billing.reduce((acc, item) => {
      if (item.invoice) {
        return acc + parseFloat(item.invoice.discounts);
      }
      return acc;
    }, 0);
    const cartDiscount = parseFloat(this.discount) || 0;
    const discount = orderDiscounts || cartDiscount || 0;
    return accounting.toFixed(discount, 2);
  },
  /**
   * @summary Discounts by Shop
   * @method getDiscountsByShop
   * @returns {object} - An object where the key is a shopId and the value is the discount for that shop
   */
  getDiscountsByShop() {
    const discountsByShop = {};
    if (this.billing && this.billing[0].invoice) { // check if we have the invoice object on the billing records
      for (const billingRecord of this.billing) {
        discountsByShop[billingRecord.shopId] = accounting.toFixed(billingRecord.invoice.discounts);
      }
    }
    return discountsByShop;
  },
  /**
   * @summary Total for Order
   * @method getTotal
   * @return {Number} Total for order
   */
  getTotal() {
    const subTotal = parseFloat(this.getSubTotal());
    const shipping = parseFloat(this.getShippingTotal());
    const taxes = parseFloat(this.getTaxTotal());
    const discount = parseFloat(this.getDiscounts());
    const discountTotal = Math.max(0, subTotal - discount);
    const total = discountTotal + shipping + taxes;
    return accounting.toFixed(total, 2);
  },
  /**
   * @summary Aggregates the cart/order total by shopId
   * @method getTotalByShop
   * @return {object} An object with a key for each shopId in the cart/order where the value is the total for that shop
   */
  getTotalByShop() {
    const subtotals = this.getSubtotalByShop();
    const taxes = this.getTaxesByShop();
    const shippingTotalByShop = this.getShippingTotalByShop();

    // no discounts right now because that will need to support multi-shop
    // TODO: Build out shop-by-shop discounts and permit discounts to reduce application fee
    const shopsInCart = Object.keys(subtotals);
    return Object.keys(subtotals).reduce((shopTotals, shopId) => {
      if (!shopTotals[shopId]) {
        let shopSubtotal = parseFloat(subtotals[shopId]);
        // pending the implementation of shop-by-shop discounts, we allow discounts to apply only on single shop carts
        if (shopsInCart.length === 1) {
          const discount = parseFloat(this.getDiscounts());
          shopSubtotal = parseFloat(subtotals[shopId]) - discount;
        }

        const shopTaxes = parseFloat(taxes[shopId]);
        const shipping = parseFloat(shippingTotalByShop[shopId]);
        const shopTotal = shopSubtotal + shopTaxes + shipping;
        shopTotals[shopId] = accounting.toFixed(shopTotal, 2);
      }
      return shopTotals;
    }, {});
  },
  /**
   * @summary Cart items organized by shopId
   * @method getItemsByShop
   * @example const cartTotals = cart.getTotalByShop();
   * @return {Object} Dict of shopIds with an array of items from that shop that are present in the cart/order
   */
  getItemsByShop() {
    if (this.items) {
      return this.items.reduce((itemsByShop, item) => {
        if (!itemsByShop[item.shopId]) {
          itemsByShop[item.shopId] = [item];
        } else {
          itemsByShop[item.shopId].push(item);
        }
        return itemsByShop;
      }, {});
    }
    return {};
  },
  /**
   * @summary Returns an array of payment methods, normalized
   * @method getPaymentMethods
   * @returns {Array} Array of Payment Method objects
   */
  getPaymentMethods() {
    const billingMethods = this.billing.map((method) => method.paymentMethod);
    const methodObjects = billingMethods.map((method) => {
      const paymentMethodObject = {
        storedCard: method.storedCard,
        processor: method.processor,
        mode: method.mode,
        transactionId: method.transactionId,
        amount: method.amount,
        method: method.method
      };
      return paymentMethodObject;
    });
    return methodObjects;
  },
  /**
   * @summary Return an array of payment methods for display removing duplicates
   * @method getUniquePaymentMethods
   * @returns {object} - An object containing the payment methods used on this order excluding duplicates
   */
  getUniquePaymentMethods() {
    const billingMethods = this.billing.map((method) => method.paymentMethod);
    const uniqueMethods = {};
    for (const billingMethod of billingMethods) {
      const key = `${billingMethod.storedCard}${billingMethod.processor}${billingMethod.method}`;
      if (!uniqueMethods[key]) {
        uniqueMethods[key] = {
          storedCard: billingMethod.storedCard,
          processor: billingMethod.processor,
          method: billingMethod.method,
          key
        };
      }
    }
    const uniqueValueArray = _.values(uniqueMethods);
    return uniqueValueArray;
  },
  /**
   * @summary Create an object that contains a summary for each shop
   * @method getShopSummary
   * @return {Object}  An object with a key for each shopId, and name + summary data for each
   */
  getShopSummary() {
    // massage items into an object by Shop
    const taxesByShop = this.getTaxesByShop();
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
        taxes: taxesByShop[shop],
        items: itemsByShop[shop],
        quantityTotal: itemsByShop[shop].reduce((qty, item) => qty + item.quantity, 0),
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
