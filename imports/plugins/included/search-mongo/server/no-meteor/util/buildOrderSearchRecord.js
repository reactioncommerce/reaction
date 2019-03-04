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
  const { billingAddress, shopId } = order;
  const fulfillmentGroup = order.shipping.find((shipping) => shipping.shopId === shopId);
  if (!fulfillmentGroup) return;

  const { address: shippingAddress, invoice, shipped, packed } = fulfillmentGroup;

  if (shippingAddress) {
    orderSearch.shippingAddress = {
      address: shippingAddress.address1,
      postal: shippingAddress.postal,
      city: shippingAddress.city,
      region: shippingAddress.region,
      country: shippingAddress.country
    };

    orderSearch.shippingName = shippingAddress.fullName;

    if (typeof shippingAddress.phone === "string") {
      orderSearch.shippingPhone = shippingAddress.phone.replace(/\D/g, "");
    }
  }

  if (billingAddress) {
    orderSearch.billingAddress = {
      address: billingAddress.address1,
      postal: billingAddress.postal,
      city: billingAddress.city,
      region: billingAddress.region,
      country: billingAddress.country
    };

    orderSearch.billingName = billingAddress.fullName;

    if (typeof billingAddress.phone === "string") {
      orderSearch.billingPhone = billingAddress.phone.replace(/\D/g, "");
    }
  }

  orderSearch.userEmails = [order.email];
  orderSearch.orderTotal = invoice.total;
  // XXX Should adjust this to be in the shop's timezone since they are likely not in the same timezone as this server.
  orderSearch.orderDate = order.createdAt && `${order.createdAt.getFullYear()}/${order.createdAt.getMonth() + 1}/${order.createdAt.getDate()}`;

  const [payment] = order.payments || [];
  if (payment) {
    orderSearch.billingStatus = payment.status;
    orderSearch.billingCard = payment.displayName;
  }

  orderSearch.currentWorkflowStatus = order.workflow.status;

  if (shipped) {
    orderSearch.shippingStatus = "Shipped";
  } else if (packed) {
    orderSearch.shippingStatus = "Packed";
  } else {
    orderSearch.shippingStatus = "New";
  }

  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

  orderSearch.product = {
    title: orderItems.map((item) => item.title)
  };
  orderSearch.variants = {
    title: orderItems.map((item) => item.variantTitle),
    optionTitle: orderItems.map((item) => item.optionTitle)
  };

  await collections.OrderSearch.updateOne({ _id: order._id }, {
    $set: orderSearch
  }, {
    upsert: true
  });
}
