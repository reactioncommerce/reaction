import { Mongo } from "meteor/mongo";
import { Migrations } from "meteor/percolate:migrations";
import { Cart, Orders, Products } from "/lib/collections";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

/**
 * @summary Migrate up one order.shipping group
 * @param {Object} group The group to convert
 * @returns {Object} The converted group
 */
function convertOrderGroupUp(group) {
  if (group.taxSummary) return group; // already converted

  group.items = group.items.map((item) => {
    delete item.taxRate;
    item.taxableAmount = item.subtotal;
    item.taxes = [];
    return item;
  });

  const taxableAmount = group.invoice.subtotal - group.invoice.discounts;
  group.invoice.taxableAmount = taxableAmount;
  group.payment.invoice.taxableAmount = taxableAmount;

  group.taxSummary = {
    calculatedAt: group.payment.createdAt || new Date(),
    tax: group.invoice.taxes,
    taxableAmount,
    taxes: []
  };

  return group;
}

/**
 * @summary Migrate up one cart
 * @param {Object} cart The cart to convert
 * @returns {Object} The converted cart
 */
function convertCartUp(cart) {
  if ({}.hasOwnProperty.call(cart, "taxSummary")) return cart; // already converted

  cart.items = cart.items.map((item) => {
    delete item.taxRate;
    item.taxableAmount = null;
    item.taxes = [];
    return item;
  });

  cart.taxSummary = null;

  return cart;
}

/**
 * @summary Migrate down one order.shipping group
 * @param {Object} group The group to convert
 * @returns {Object} The converted group
 */
function convertOrderGroupDown(group) {
  if (!{}.hasOwnProperty.call(group, "taxSummary")) return group; // already converted

  group.items = group.items.map((item) => {
    delete item.taxableAmount;
    delete item.taxes;
    return item;
  });

  delete group.invoice.taxableAmount;
  delete group.payment.invoice.taxableAmount;
  delete group.taxSummary;

  return group;
}

/**
 * @summary Migrate down one cart
 * @param {Object} cart The cart to convert
 * @returns {Object} The converted cart
 */
function convertCartDown(cart) {
  if (!{}.hasOwnProperty.call(cart, "taxSummary")) return cart; // already converted

  cart.items = cart.items.map((item) => {
    delete item.taxableAmount;
    delete item.taxes;
    return item;
  });

  delete cart.taxSummary;

  return cart;
}

Migrations.add({
  version: 45,

  up() {
    // Orders
    findAndConvertInBatches({
      collection: Orders,
      converter(order) {
        order.shipping = order.shipping.map(convertOrderGroupUp);
        return order;
      }
    });

    // Carts
    findAndConvertInBatches({
      collection: Cart,
      converter: (cart) => convertCartUp(cart)
    });

    // Products
    findAndConvertInBatches({
      collection: Products,
      converter: (product) => {
        product.isTaxable = product.taxable;
        delete product.taxable;
        return product;
      }
    });

    // Taxes
    // This collection is defined in the taxes plugin only, so we get a new instance of it here
    const Taxes = new Mongo.Collection("Taxes", { defineMutationMethods: false });
    Taxes.update({}, {
      // Remove all props that were never implemented
      $unset: {
        cartMethod: "",
        discountsIncluded: "",
        isCommercial: "",
        method: "",
        taxIncluded: "",
        taxShipping: ""
      }
    }, { bypassCollection2: true, multi: true });
  },

  down() {
    // Orders
    findAndConvertInBatches({
      collection: Orders,
      converter(order) {
        order.shipping = order.shipping.map(convertOrderGroupDown);
        return order;
      }
    });

    // Carts
    findAndConvertInBatches({
      collection: Cart,
      converter: (cart) => convertCartDown(cart)
    });

    // Products
    findAndConvertInBatches({
      collection: Products,
      converter: (product) => {
        product.taxable = product.isTaxable;
        delete product.isTaxable;
        return product;
      }
    });
  }
});
