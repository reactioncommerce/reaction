import ReactionError from "@reactioncommerce/reaction-error";
import calculateDiscountAmount from "./calculateDiscountAmount.js";
import formatMoney from "./formatMoney.js";

/**
 * @summary Recalculate shipping discount
 * @param {Object} context - The application context
 * @param {Object} shipping - The shipping record
 * @returns {Promise<void>} undefined
 */
export default function recalculateShippingDiscount(context, shipping) {
  let totalDiscount = 0;
  const { shipmentMethod, shipmentQuotes } = shipping;
  if (!shipmentMethod || shipmentQuotes.length === 0) return;

  const selectedShipmentQuote = shipmentQuotes.find((quote) => quote.method._id === shipmentMethod._id);
  if (!selectedShipmentQuote) throw ReactionError("not-found", "Shipment quote not found in the cart");

  const rate = selectedShipmentQuote.rate || 0;
  const handling = selectedShipmentQuote.handlingPrice || 0;
  shipmentMethod.rate = rate;
  shipmentMethod.undiscountedRate = rate;

  shipping.discounts.forEach((discount) => {
    const undiscountedRate = shipmentMethod.rate;
    const { discountMaxValue } = discount;

    const discountRate = calculateDiscountAmount(context, undiscountedRate, discount);

    // eslint-disable-next-line require-jsdoc
    function getDiscountedRate() {
      const discountedRate = formatMoney(undiscountedRate - discountRate);
      if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
        return Math.min(discountedRate, discountMaxValue);
      }
      return discountedRate;
    }

    const discountedRate = getDiscountedRate();

    totalDiscount += discountedRate;
    discount.discountedAmount = discountedRate;
    shipmentMethod.rate = discountedRate;
  });

  shipmentMethod.shippingPrice = shipmentMethod.rate + handling;
  shipmentMethod.discount = totalDiscount;
}
