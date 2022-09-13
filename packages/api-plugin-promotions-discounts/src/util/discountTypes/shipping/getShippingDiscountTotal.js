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
