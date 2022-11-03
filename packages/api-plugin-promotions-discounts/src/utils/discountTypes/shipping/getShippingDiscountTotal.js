/**
 * @summary Get the total discount amount for a shipping discount
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to get the shipping discount total for
 * @returns {Number} The total discount amount for the shipping discount
 */
export default function getShippingDiscountTotal(context, cart) {
  const { shipping } = cart;
  let totalShippingDiscount = 0;
  for (const fulfillmentGroup of shipping) {
    const { shipmentMethod } = fulfillmentGroup;
    if (shipmentMethod && shipmentMethod.undiscountedRate) {
      totalShippingDiscount += shipmentMethod.undiscountedRate - shipmentMethod.rate;
    }
  }
  return totalShippingDiscount;
}
