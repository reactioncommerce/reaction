const REQUIRED_FIELDS = ["_id", "shopId", "shippingName", "shippingPhone", "billingName", "userEmails",
  "shippingAddress", "billingAddress", "shippingStatus", "billingStatus", "orderTotal", "orderDate"];

/**
 * @summary Builds an order search record for an order
 * @param {Object} collections MongoDB collections map
 * @param {Object} order The order doc
 * @returns {undefined}
 */
export default async function buildOrderSearchRecord(collections, order) {
  const orderSearch = {};
  for (const field of REQUIRED_FIELDS) {
    orderSearch[field] = order[field];
  }

  // get the billing and shipping for the order shop
  const { shopId } = order;
  const shopBilling = order.billing.find((billing) => billing.shopId === shopId) || {};
  const shopShipping = order.shipping.find((shipping) => shipping.shopId === shopId) || {};

  const shopBillingAddress = shopBilling.address;
  const shopShippingAddress = shopShipping.address;

  orderSearch.billingName = shopBillingAddress && shopBillingAddress.fullName;
  orderSearch.billingPhone = shopBillingAddress && shopBillingAddress.phone.replace(/\D/g, "");
  orderSearch.shippingName = shopShippingAddress && shopShippingAddress.fullName;
  if (shopShippingAddress && shopShippingAddress.phone) {
    orderSearch.shippingPhone = shopShippingAddress && shopShippingAddress.phone.replace(/\D/g, "");
  }

  orderSearch.billingAddress = {
    address: shopBillingAddress && shopBillingAddress.address1,
    postal: shopBillingAddress && shopBillingAddress.postal,
    city: shopBillingAddress && shopBillingAddress.city,
    region: shopBillingAddress && shopBillingAddress.region,
    country: shopBillingAddress && shopBillingAddress.country
  };
  orderSearch.shippingAddress = {
    address: shopShippingAddress && shopShippingAddress.address1,
    postal: shopShippingAddress && shopShippingAddress.postal,
    city: shopShippingAddress && shopShippingAddress.city,
    region: shopShippingAddress && shopShippingAddress.region,
    country: shopShippingAddress && shopShippingAddress.country
  };

  orderSearch.userEmails = [order.email];
  orderSearch.orderTotal = shopBilling.invoice && shopBilling.invoice.total;
  // XXX Should adjust this to be in the shop's timezone since they are likely not in the same timezone as this server.
  orderSearch.orderDate = order.createdAt && `${order.createdAt.getFullYear()}/${order.createdAt.getMonth() + 1}/${order.createdAt.getDate()}`;
  orderSearch.billingStatus = shopBilling.paymentMethod && shopBilling.paymentMethod.status;
  orderSearch.billingCard = shopBilling.paymentMethod && shopBilling.paymentMethod.displayName;
  orderSearch.currentWorkflowStatus = order.workflow.status;
  if (shopShipping.shipped) {
    orderSearch.shippingStatus = "Shipped";
  } else if (shopShipping.packed) {
    orderSearch.shippingStatus = "Packed";
  } else {
    orderSearch.shippingStatus = "New";
  }
  orderSearch.product = {
    title: order.items.map((item) => item.title)
  };
  orderSearch.variants = {
    title: order.items.map((item) => item.variantTitle),
    optionTitle: order.items.map((item) => item.optionTitle)
  };

  await collections.OrderSearch.updateOne({ _id: order._id }, {
    $set: orderSearch
  }, {
    upsert: true
  });
}
