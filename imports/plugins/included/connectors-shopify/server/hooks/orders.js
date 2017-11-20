/* eslint camelcase: 0 */
import accounting from "accounting-js";
import Shopify from "shopify-api-node";
import { Reaction, Logger } from "/server/api";
import { Orders, Shops } from "/lib/collections";
import { getApiInfo } from "../methods/api";

export function exportToShopify(doc) {
  Logger.info("exporting to Shopify");
  const apiCreds = getApiInfo();
  const shopify = new Shopify(apiCreds);
  const numShopOrders = doc.billing.length; // if we have multiple billing, we have multiple shops
  for (let i = 0; i < numShopOrders; i++) {
    // send a shopify order once for each merchant order
    const shopId = doc.billing[i].shopId;
    const shopifyOrder = convertRcOrderToShopifyOrder(doc, i, shopId);
    shopify.order.create(shopifyOrder);
  }
}

function convertRcOrderToShopifyOrder(order, index, shopId) {
  const shopifyOrder = {};
  const billingAddress = convertAddress(order.billing[index]);
  shopifyOrder.billing_address = billingAddress;
  const shippingAddress = convertAddress(order.shipping[index]);
  shopifyOrder.shipping_address = convertAddress(shippingAddress);
  shopifyOrder.customer = convertCustomer(billingAddress, order);
  shopifyOrder.email = order.email;
  const paymentType = order.billing[index].method;
  if (paymentType === "credit" && order.billing[index].mode === "authorize") {
    shopifyOrder.financial_status = "authorized";
  } else {
    shopifyOrder.financial_status = "paid";
  }
  shopifyOrder.id = order._id;
  const itemsForShop = order.getItemsByShop()[shopId];
  shopifyOrder.line_items = convertLineItems(itemsForShop, order);
  shopifyOrder.transactions = convertTransactions(order.billing[index].paymentMethod);
  return shopifyOrder;
}

function normalizeWeight(weight, shopId) {
  // if weight is not grams, convert to grams if is grams just return
  const shop = Shops.findOne(shopId);
  const { baseUOM } = shop;
  // Could've used switch, this was easier to read
  if (baseUOM === "g") {
    return weight;
  }
  if (baseUOM === "lb") {
    const grams = weight * 453.592;
    return grams;
  }

  if (baseUOM === "oz") {
    const grams = weight * 28.35;
    return grams;
  }

  if (baseUOM === "kg") {
    const grams = weight / 1000;
    return grams;
  }
}

function convertLineItems(items, order) {
  const lineItems = items.map((item) => {
    const lineItem = {};
    lineItem.fulfillable_quantity = item.quantity;
    lineItem.fulfillment_service = "manual";
    lineItem.fullfillment_status = null;
    lineItem.grams = normalizeWeight(item.parcel.weight, item.shopId);
    lineItem.id = item._id;
    lineItem.product_id = item.productId;
    lineItem.quantity = item.quantity;
    lineItem.requires_shipping = item.product.requiresShipping;
    // lineItem.sku = ??? Not sure what should be the SKU here
    lineItem.title = item.product.title;
    lineItem.variant_id = item.variants._id;
    lineItem.variant_title = item.variants.title;
    lineItem.vendor = item.vendor;
    lineItem.taxable = item.variants.taxable;
    if (order.taxes) {
      lineItem.tax_lines = [];
      // when using Avalara we get tax detail
      // get the tax iten for this particular line
      const taxItem = order.taxes.filter((tax) => tax.lineNumber === item._id);
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
    // lineItem.total_discount = ????;
    return lineItem;
  });
  return lineItems;
}

function convertTransactions(paymentMethod) {
  return paymentMethod;
}

function convertAddress(address) {
  const convertedAddress = {};
  convertedAddress.address1 = address.address1;
  convertedAddress.address2 = address.address2 || "";
  convertedAddress.city = address.city;
  convertedAddress.country = address.country;
  convertedAddress.country_code = address.country;
  convertedAddress.name = address.name;
  [ convertedAddress.first_name, convertedAddress.last_name ] = address.fullName.split(" ", 1);
  convertedAddress.phone = address.phone;
  convertedAddress.zip = address.postal;
  convertedAddress.province_code = address.region;
  return convertedAddress;
}

function convertCustomer(address, order) {
  const [ first_name, last_name ] = address.fullName.split(" ", 1);
  const customer = {
    accepts_marketing: false,
    email: order.email,
    phone: address.phone,
    first_name,
    last_name
  };
  return customer;
}


Orders.after.insert((userId, doc) => {
  const { settings } = Reaction.getPackageSettings("reaction-connectors-shopify");
  const { syncHooks } = settings;
  syncHooks.forEach((hook) => {
    if (hook.topic === "orders" && hook.event === "order/create") {
      if (hook.syncType === "exportToShopify") { // should this just be dynamic?
        exportToShopify(doc);
      }
    }
  });
});
