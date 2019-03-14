
/**
 * @summary Calculate final shipping, discounts, surcharges, and taxes; builds an invoice object
 *   with the totals on it; and sets group.invoice.
 * @param {String} currencyCode Currency code of totals
 * @param {Object} group The fulfillment group to be mutated
 * @param {Number} groupDiscountTotal Total discount amount for group
 * @param {Number} groupSurchargeTotal Total surcharge amount for group
 * @param {Number} taxableAmount Total taxable amount for group
 * @param {Number} taxTotal Total tax for group
 * @param {Object} taxData Custom tax data coming from tax provider
 * @returns {undefined}
 */
export default function addInvoiceToGroup({
  currencyCode,
  group,
  groupDiscountTotal,
  groupSurchargeTotal,
  itemTaxes,
  taxableAmount,
  taxTotal,
  taxData
}) {
  // Items
  const itemTotal = group.items.reduce((sum, item) => (sum + item.subtotal), 0);

  // Taxes
  const effectiveTaxRate = taxableAmount > 0 ? taxTotal / taxableAmount : 0;

  // Fulfillment
  const shippingTotal = group.shipmentMethod.rate || 0;
  const handlingTotal = group.shipmentMethod.handling || 0;
  const fulfillmentTotal = shippingTotal + handlingTotal;

  // Totals
  // To avoid rounding errors, be sure to keep this calculation the same between here and
  // `buildOrderInputFromCart.js` in the client code.
  const total = Math.max(0, itemTotal + fulfillmentTotal + taxTotal + groupSurchargeTotal - groupDiscountTotal);

  group.items = group.items.map((item) => {
    const itemTax = itemTaxes.find((entry) => entry.itemId === item._id) || {};

    const updatedItem = {
      ...item,
      tax: itemTax.tax,
      taxableAmount: itemTax.taxableAmount,
      taxes: itemTax.taxes
    };

    if (itemTax.customFields) {
      updatedItem.customTaxFields = itemTax.customFields;
    }

    return updatedItem;
  });

  group.invoice = {
    currencyCode,
    discounts: groupDiscountTotal,
    effectiveTaxRate,
    shipping: fulfillmentTotal,
    subtotal: itemTotal,
    surcharges: groupSurchargeTotal,
    taxableAmount,
    taxes: taxTotal,
    taxData,
    total
  };
}
