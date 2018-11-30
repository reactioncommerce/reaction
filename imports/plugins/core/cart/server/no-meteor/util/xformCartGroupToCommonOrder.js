/**
 * @param {Object} cart A cart
 * @param {Object} group The cart fulfillment group
 * @param {Object} context App context
 * @returns {Object} Valid CommonOrder from a cart group
 */
export default async function xformCartGroupToCommonOrder(cart, group, context) {
  const { collections } = context;
  const { currencyCode } = cart;

  let items = group.itemIds.map((itemId) => cart.items.find((item) => item._id === itemId));
  items = items.filter((item) => !!item); // remove nulls

  // We also need to add `subtotal` on each item, based on the current price of that item in
  // the catalog. `getFulfillmentGroupTaxes` uses subtotal prop to calculate the tax.
  items = items.map((item) => ({
    _id: item._id,
    isTaxable: item.isTaxable,
    parcel: item.parcel,
    price: item.price,
    productId: item.productId,
    quantity: item.quantity,
    shopId: item.shopId,
    subtotal: {
      amount: item.price.amount * item.quantity,
      currencyCode
    },
    taxCode: item.taxCode,
    title: item.title,
    variantId: item.variantId
  }));

  const { address, shipmentMethod, shopId, type: fulfillmentType } = group;
  const shop = await collections.Shops.findOne({ _id: shopId });

  return {
    billingAddress: null,
    cartId: cart._id,
    currencyCode: cart.currencyCode,
    fulfillmentPrices: {
      handling: {
        amount: (shipmentMethod && shipmentMethod.handling) || 0,
        currencyCode
      },
      shipping: {
        amount: (shipmentMethod && shipmentMethod.rate) || 0,
        currencyCode
      },
      total: {
        amount: shipmentMethod ? ((shipmentMethod.handling || 0) + (shipmentMethod.rate || 0)) : 0,
        currencyCode
      }
    },
    fulfillmentType,
    items,
    orderId: null,
    originAddress: (shop && Array.isArray(shop.addressBook) && shop.addressBook[0]) || null,
    shippingAddress: address || null,
    shopId,
    sourceType: "cart"
  };
}
