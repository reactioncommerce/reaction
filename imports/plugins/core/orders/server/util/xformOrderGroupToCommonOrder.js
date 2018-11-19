/**
 * @param {Object} group The order fulfillment group
 * @param {String} currencyCode The currency code
 * @param {Object} collections Map of MongoDB collections
 * @returns {Object} Valid CommonOrder for the given order group
 */
export default async function xformOrderGroupToCommonOrder(group, currencyCode, collections) {
  const items = group.items.map((item) => ({
    _id: item._id,
    isTaxable: item.isTaxable,
    parcel: item.parcel,
    price: item.price,
    quantity: item.quantity,
    shopId: item.shopId,
    subtotal: {
      amount: item.subtotal,
      currencyCode
    },
    taxCode: item.taxCode,
    variantId: item.variantId
  }));

  const { address, shipmentMethod, shopId, type: fulfillmentType } = group;
  const shop = await collections.Shops.findOne({ _id: shopId });

  return {
    currencyCode,
    fulfillmentPrices: {
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
    },
    fulfillmentType,
    items,
    originAddress: (shop && Array.isArray(shop.addressBook) && shop.addressBook[0]) || null,
    shippingAddress: address || null,
    shopId
  };
}
