/* eslint camelcase: 0 */
import Shopify from "shopify-api-node";
import { Reaction, Logger } from "/server/api";
import { Orders } from "/lib/collections";
import { getApiInfo } from "../methods/api";

export function exportToShopify(doc) {
  Logger.info("exporting to Shopify");
  const apiCreds = getApiInfo();
  const shopify = new Shopify(apiCreds);
  const numShopOrders = doc.billing.length; // if we have multiple billing, we have multiple shops
  for (let i = 0; i < numShopOrders; i++) {
    // send a shopify order once for each merchant order
    const shopifyOrder = convertRcOrderToShopifyOrder(doc, i);
    shopify.order.create(shopifyOrder);
  }
}

function convertRcOrderToShopifyOrder(order, index) {
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
  shopifyOrder.line_items = convertLineItems(order.items);
  shopifyOrder.transactions = convertTransactions(order.billing[index].paymentMethod);
  return shopifyOrder;
}

function convertLineItems(items) {
  // does not actually convert items yet
  return items;
}

function convertTransactions(paymentMethod) {
  // does not actually convert paymentmethod to transactions yet
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
