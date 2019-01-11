/**
 * @param {Object} [billingAddress] Billing address, if one was collected
 * @param {String} [cartId] The source cart ID, if applicable
 * @param {Object} collections Map of MongoDB collections
 * @param {String} currencyCode The currency code
 * @param {Object} group The order fulfillment group
 * @param {String} orderId The order ID
 * @returns {Object} Valid CommonOrder for the given order group
 */
export default async function xformOrderGroupToCommonOrder({ billingAddress = null, cartId, collections, currencyCode, group, orderId, discountTotal }) {
  const items = group.items.map((item) => ({
    _id: item._id,
    isTaxable: item.isTaxable,
    parcel: item.parcel,
    price: item.price,
    productId: item.productId,
    quantity: item.quantity,
    shopId: item.shopId,
    subtotal: {
      amount: item.subtotal,
      currencyCode
    },
    taxCode: item.taxCode,
    title: item.title,
    variantId: item.variantId
  }));

  const { address, shipmentMethod, shopId, type: fulfillmentType } = group;
  const shop = await collections.Shops.findOne({ _id: shopId });

  let fulfillmentPrices = {
    handling: null,
    shipping: null,
    total: null
  };

  if (shipmentMethod) {
    fulfillmentPrices = {
      handling: {
        amount: shipmentMethod.handling || 0,
        currencyCode
      },
      shipping: {
        amount: shipmentMethod.rate || 0,
        currencyCode
      },
      total: {
        amount: (shipmentMethod.handling || 0) + (shipmentMethod.rate || 0),
        currencyCode
      }
    };
  }

  // TODO: In the future, we should update this with a discounts update
  // Discounts are stored as the sum of all discounts, per cart. This will need to be updated when we refactor discounts to go by group.
  const groupItemTotal = group.items.reduce((sum, item) => (sum + item.subtotal), 0);
  // orderItemTotal will need to be updated to be the actual total when we eventually have more than one group available
  const orderItemTotal = groupItemTotal;

  const totals = {
    groupDiscountTotal: {
      amount: discountTotal,
      currencyCode
    },
    groupItemTotal: {
      amount: groupItemTotal,
      currencyCode
    },
    groupTotal: {
      amount: groupItemTotal - discountTotal,
      currencyCode
    },
    orderDiscountTotal: {
      amount: discountTotal,
      currencyCode
    },
    orderItemTotal: {
      amount: orderItemTotal,
      currencyCode
    },
    orderTotal: {
      amount: orderItemTotal - discountTotal,
      currencyCode
    }
  };

  return {
    billingAddress,
    cartId,
    currencyCode,
    fulfillmentPrices,
    fulfillmentType,
    items,
    orderId,
    originAddress: (shop && Array.isArray(shop.addressBook) && shop.addressBook[0]) || null,
    shippingAddress: address || null,
    shopId,
    sourceType: "order",
    totals
  };
}
