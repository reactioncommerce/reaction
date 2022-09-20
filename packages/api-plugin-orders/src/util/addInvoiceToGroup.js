import accounting from "accounting-js";

/**
 * @summary Calculate final shipping, discounts, surcharges, and taxes; builds an invoice object
 *   with the totals on it; and sets group.invoice.
 * @param {String} currencyCode Currency code of totals
 * @param {Object} group The fulfillment group to be mutated
 * @param {Number} groupDiscountTotal Total discount amount for group
 * @param {Number} groupSurchargeTotal Total surcharge amount for group
 * @param {Number} taxableAmount Total taxable amount for group
 * @param {Number} taxTotal Total tax for group
 * @returns {undefined}
 */
export default function addInvoiceToGroup({
  currencyCode,
  group,
  groupDiscountTotal,
  groupSurchargeTotal,
  taxableAmount,
  taxTotal
}) {
  // Items
  const itemTotal = +accounting.toFixed(group.items.reduce((sum, item) => (sum + item.subtotal), 0), 3);

  // Taxes
  const effectiveTaxRate = taxableAmount > 0 ? taxTotal / taxableAmount : 0;

  // Fulfillment
  const shippingTotal = group.shipmentMethod.rate || 0;
  const handlingTotal = group.shipmentMethod.handling || 0;
  const fulfillmentTotal = shippingTotal + handlingTotal;

  // Totals
  // To avoid rounding errors, be sure to keep this calculation the same between here and
  // `buildOrderInputFromCart.js` in the client code.
  const total = +accounting.toFixed(Math.max(0, itemTotal + fulfillmentTotal + taxTotal + groupSurchargeTotal - groupDiscountTotal), 3);

  group.invoice = {
    currencyCode,
    discounts: groupDiscountTotal,
    effectiveTaxRate,
    shipping: fulfillmentTotal,
    subtotal: itemTotal,
    surcharges: groupSurchargeTotal,
    taxableAmount,
    taxes: taxTotal,
    total
  };
}
