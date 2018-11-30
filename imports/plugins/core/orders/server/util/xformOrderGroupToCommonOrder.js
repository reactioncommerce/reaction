/**
 * @param {Object} [billingAddress] Billing address, if one was collected
 * @param {String} [cartId] The source cart ID, if applicable
 * @param {Object} collections Map of MongoDB collections
 * @param {String} currencyCode The currency code
 * @param {Object} group The order fulfillment group
 * @param {String} orderId The order ID
 * @returns {Object} Valid CommonOrder for the given order group
 */
export default async function xformOrderGroupToCommonOrder({ billingAddress = null, cartId, collections, currencyCode, group, orderId }) {
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
        amount: (shipmentMethod && shipmentMethod.handling) || 0,
        currencyCode
      },
      shipping: {
        amount: (shipmentMethod && shipmentMethod.rate) || 0,
        currencyCode
      },
      total: {
        amount: shipmentMethod ? (shipmentMethod.handling || 0) + (shipmentMethod.rate || 0) : 0,
        currencyCode
      }
    };
  }

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
    sourceType: "order"
  };
}
