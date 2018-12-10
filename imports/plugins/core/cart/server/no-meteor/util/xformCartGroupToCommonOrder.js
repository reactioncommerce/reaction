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
        amount: shipmentMethod.rate,
        currencyCode
      },
      total: {
        amount: (shipmentMethod.handling || 0) + shipmentMethod.rate,
        currencyCode
      }
    };
  }

  // TODO: In the future, we should update this with a discounts update
  // Discounts are stored as the sum of all discounts, per cart. This will need to be updated when we refactor discounts to go by group.
  const discountTotal = cart.discount || 0;
  const groupItemTotal = group.items.reduce((sum, item) => (sum + item.subtotal.amount), 0);
  // orderItemTotal will need to be updated to be the actual total when we eventually have more than one group available
  const orderItemTotal = groupItemTotal;

  const totals = {
    groupDiscountTotal: {
      amount: discountTotal,
      currencyCode: cart.currencyCode
    },
    groupItemTotal: {
      amount: groupItemTotal,
      currencyCode: cart.currencyCode
    },
    groupTotal: {
      amount: groupItemTotal - discountTotal,
      currencyCode: cart.currencyCode
    },
    orderDiscountTotal: {
      amount: discountTotal,
      currencyCode: cart.currencyCode
    },
    orderItemTotal: {
      amount: orderItemTotal,
      currencyCode: cart.currencyCode
    },
    orderTotal: {
      amount: orderItemTotal - discountTotal,
      currencyCode: cart.currencyCode
    }
  };


  return {
    billingAddress: null,
    cartId: cart._id,
    currencyCode: cart.currencyCode,
    fulfillmentPrices,
    fulfillmentType,
    items,
    orderId: null,
    originAddress: (shop && Array.isArray(shop.addressBook) && shop.addressBook[0]) || null,
    shippingAddress: address || null,
    shopId,
    sourceType: "cart",
    totals
  };
}
