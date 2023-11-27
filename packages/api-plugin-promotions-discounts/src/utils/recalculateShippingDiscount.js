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

  const { method } = selectedShipmentQuote;
  const rate = method.undiscountedRate || method.rate;
  const handling = method.handling || 0;
  shipmentMethod.rate = rate;
  shipmentMethod.undiscountedRate = rate;

  shipping.discounts.forEach((discount) => {
    const undiscountedRate = shipmentMethod.rate;

    const discountedRate = calculateDiscountAmount(context, undiscountedRate, discount);

    const { discountMaxValue } = discount;
    // eslint-disable-next-line require-jsdoc
    function getDiscountedRate() {
      const discountRate = formatMoney(undiscountedRate - discountedRate);
      if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
        return Math.min(discountRate, discountMaxValue);
      }
      return discountRate;
    }

    const discountRate = getDiscountedRate();

    totalDiscount += discountRate;
    discount.discountedAmount = discountRate;
    shipmentMethod.rate = formatMoney(undiscountedRate - discountRate);
  });

  shipmentMethod.shippingPrice = shipmentMethod.rate + handling;
  shipmentMethod.discount = totalDiscount;
}
