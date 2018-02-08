/* eslint camelcase: 0 */
import accounting from "accounting-js";
import Shopify from "shopify-api-node";
import { parse, format } from "libphonenumber-js";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Logger } from "/server/api";
import { convertWeight } from "/lib/api";
import { Orders, Shops } from "/lib/collections";
import { getApiInfo } from "../api";

/**
 * @private
 * @summary build a new object for export to Shopify
 * @param {Object} doc - the order to convert
 * @param {Number} index - the sequence number of billing/shipping records we are processing
 * @param {String} shopId - the Id of the shop we are processing for
 * @param {Object} existingCustomer - the existing customer Id if it exists
 * @returns {Object} shopifyOrder - the converted order
 */
function convertOrderToShopifyOrder(doc, index, shopId, existingCustomer = undefined) {
  check(existingCustomer, Match.OneOf(Object, undefined));
  const order = Orders.findOne(doc._id); // only this object has the original transforms defined
  const paymentType = order.billing[index].method;
  const itemsForShop = order.getItemsByShop()[shopId];
  const shopifyOrder = {};
  shopifyOrder.billing_address = convertAddress(order.billing[index].address);
  shopifyOrder.shipping_address = convertAddress(order.shipping[index].address);
  if (!existingCustomer) {
    shopifyOrder.customer = convertCustomer(shopifyOrder.billing_address, order);
  } else {
    shopifyOrder.customer = existingCustomer;
  }
  shopifyOrder.email = order.email;
  if (paymentType === "credit" && order.billing[index].mode === "authorize") {
    shopifyOrder.financial_status = "authorized";
  } else {
    shopifyOrder.financial_status = "paid";
  }
  shopifyOrder.id = order._id;
  shopifyOrder.line_items = convertLineItems(itemsForShop, order);
  shopifyOrder.shipping_lines = convertShipping(order, index);
  shopifyOrder.phone = order.billing[index].address.phone;
  shopifyOrder.source_name = "reaction_export";
  shopifyOrder.subtotal_price = order.getSubtotalByShop()[shopId];
  shopifyOrder.token = order._id;
  shopifyOrder.total_discounts = order.getDiscountsByShop()[shopId];
  shopifyOrder.total_line_item_price = order.getItemsByShop()[shopId].reduce((total, item) => total + (item.variants.price * item.quantity), 0);
  shopifyOrder.total_price = order.getTotalByShop()[shopId];
  shopifyOrder.total_tax = order.getTaxesByShop()[shopId];
  shopifyOrder.total_weight = shopifyOrder.line_items.reduce((sum, item) => sum + (item.grams * item.quantity), 0);
  return shopifyOrder;
}

/**
 * @private
 * @summary Normalize all weights to grams
 * @param {Number} weight - the original weight value
 * @param {String} shopId - the shop we are converting for
 * @returns {Number} the normalized value
 */
function normalizeWeight(weight, shopId) {
  // if weight is not grams, convert to grams if is grams just return
  const shop = Shops.findOne(shopId);
  const { baseUOM } = shop;
  if (baseUOM === "g") {
    return weight;
  }
  if (baseUOM === "lb") {
    return convertWeight("lb", "g", weight);
  }

  if (baseUOM === "oz") {
    return convertWeight("oz", "g", weight);
  }

  if (baseUOM === "kg") {
    return convertWeight("kg", "g", weight);
  }
}

/**
 * @private
 * @summary Convert individual line items of an order
 * @param {Array} items - The items on the order object
 * @param {Object} order - The order we are converting for
 * @returns {Array} An array of converted line items
 */
function convertLineItems(items, order) {
  const lineItems = items.map((item) => {
    const lineItem = {};
    lineItem.fulfillable_quantity = item.quantity;
    lineItem.fulfillment_service = "manual";
    lineItem.fullfillment_status = null;
    if (item.parcel && item.parcel.weight) {
      lineItem.grams = normalizeWeight(item.parcel.weight, item.shopId);
    }
    lineItem.id = item._id;
    lineItem.product_id = item.productId;
    lineItem.quantity = item.quantity;
    lineItem.requires_shipping = item.product.requiresShipping;
    if (item.variants.sku) { // this doesn't appear to be written anywhere but it's in the schema
      lineItem.sku = item.variants.sku;
    }
    lineItem.title = item.product.title;
    lineItem.variant_id = item.variants._id;
    lineItem.variant_title = item.variants.title;
    lineItem.vendor = item.product.vendor;
    lineItem.taxable = item.variants.taxable;
    lineItem.price = item.variants.price;
    if (order.taxes) {
      lineItem.tax_lines = [];
      // when using Avalara we get tax detail
      // get the tax iten for this particular line
      const taxItem = order.taxes.find((tax) => tax.lineNumber === item._id);
      taxItem.details.forEach((detail) => {
        const taxLine = {
          title: detail.taxName,
          price: accounting.toFixed(detail.taxCalculated, 2),
          rate: detail.rate
        };
        lineItem.tax_lines.push(taxLine);
      });
    }
    // for custom tax codes we get this one data point
    if (item.taxData) {
      lineItem.tax_lines = [{
        title: item.taxData.taxCode,
        price: accounting.toFixed((item.taxData.rate / 100) * item.variants.price, 2),
        rate: item.taxData.rate / 100
      }];
    }
    return lineItem;
  });
  return lineItems;
}

/**
 * @private
 * @summary Convert address object into Shopify-compatible format
 * @param {Object} address - the address to convert
 * @returns {Object} converted address
 */
function convertAddress(address) {
  const convertedAddress = {};
  convertedAddress.address1 = address.address1;
  convertedAddress.address2 = address.address2 || "";
  convertedAddress.city = address.city;
  convertedAddress.country = address.country;
  convertedAddress.country_code = address.country;
  convertedAddress.name = address.fullName;
  const [firstName, ...lastName] = address.fullName.split(" ");
  convertedAddress.first_name = firstName;
  convertedAddress.last_name = lastName.join(" ");
  convertedAddress.phone = address.phone;
  convertedAddress.zip = address.postal;
  convertedAddress.province_code = address.region;
  return convertedAddress;
}

async function isExistingCustomer(address, email, shopify) {
  const query = `email:${email}`;
  const customerByEmailPromise = shopify.customer.search({ query });
  return customerByEmailPromise;
}

function normalizePhone(phoneToNormalize, countryCode) {
  const { phone } = parse(phoneToNormalize, countryCode);
  const formattedPhone = format(phone, countryCode, "International").replace(/\s/g, "");
  return formattedPhone;
}

/**
 * @private
 * @summary Create a customer object in Shopify-compatible format
 * @param {Object} address - Converted address object
 * @param {Object} order - Original order we are converting
 * @returns {Object} Shopify-compatible customer object
 */
function convertCustomer(address, order) {
  const formattedPhone = normalizePhone(address.phone, address.country_code);
  const customer = {
    accepts_marketing: false,
    email: order.email,
    phone: formattedPhone,
    first_name: address.first_name,
    last_name: address.last_name
  };
  return customer;
}

/**
 * @private
 * @summary Create a shippingMethod object to record shipping on a Shopify order
 * @param {Object} order - The order with shipping data
 * @param {Number} index - The shop index to convert
 * @returns {Array} An array of shipping lines
 */
function convertShipping(order, index) {
  const shippingLines = [];
  // I don't think we need to check this because we should **always** have a shipping record per shop
  // so worst case shipmentMethod is undefined and we will skip
  const method = order.shipping[index].shipmentMethod;
  if (method) {
    const shippingMethod = {
      code: method.name,
      price: method.rate,
      title: method.name,
      source: method.carrier
    };
    shippingLines.push(shippingMethod);
  }
  return shippingLines;
}


/**
 * @summary Export an order to Shopify
 * @param {Object} doc - The order to convert
 * @returns {Promise.<Array>} - An array of exported orders
 */
export async function exportToShopify(doc) {
  const numShopOrders = doc.billing.length; // if we have multiple billing, we have multiple shops
  Logger.debug(`Exporting ${numShopOrders} order(s) to Shopify`);
  const shopifyOrders = [];
  for (let index = 0; index < numShopOrders; index += 1) {
    // send a shopify order once for each merchant order
    const { shopId } = doc.billing[index];
    const apiCreds = getApiInfo(shopId);
    const shopify = new Shopify(apiCreds);
    const existingCustomerQuery = await isExistingCustomer(doc.billing[index].address, doc.email, shopify); // eslint-disable-line no-await-in-loop
    // this should never happen but I want a meaningful error here in case it does
    if (existingCustomerQuery.length > 1) {
      throw new Meteor.Error("duplicate-customer", "Discovered more than one customer in Shopify. Cannot continue");
    }
    const existingCustomer = existingCustomerQuery[0];
    const shopifyOrder = convertOrderToShopifyOrder(doc, index, shopId, existingCustomer);
    Logger.debug("sending shopify order", shopifyOrder, doc._id);
    const newShopifyOrder = await shopify.order.create(shopifyOrder); // eslint-disable-line no-await-in-loop
    markExported(newShopifyOrder, shopId, doc);
    shopifyOrders.push(newShopifyOrder);
  }
  return shopifyOrders;
}


/**
 * @private
 * @summary Mark orders as exported after export
 * @param {Object} exportedOrder the converted order
 * @param {String} shopId - the shopId to attach
 * @param {Object} order - the order to be marked
 */
function markExported(exportedOrder, shopId, order) {
  Orders.update({ _id: order._id }, {
    $push: {
      exportHistory: {
        status: "success",
        dateAttempted: new Date(),
        exportMethod: "reaction-connectors-shopify",
        destinationIdentifier: exportedOrder.id,
        shopId
      }
    }
  });
}
