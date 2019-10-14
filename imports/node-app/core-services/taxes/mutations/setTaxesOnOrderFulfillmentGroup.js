/**
 * @summary Adds taxes to an order fulfillment group. Mutates `group`.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} group Fulfillment group object
 * @param {Object} commonOrder The group in CommonOrder schema
 * @returns {Object} An object with `taxableAmount` and `taxTotal` properties. Also mutates `group`.
 */
export default async function setTaxesOnOrderFulfillmentGroup(context, { group, commonOrder }) {
  const { itemTaxes, taxSummary } = await context.mutations.getFulfillmentGroupTaxes(context, { order: commonOrder, forceZeroes: true });
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

  group.taxSummary = taxSummary;

  return {
    taxableAmount: taxSummary.taxableAmount,
    taxTotal: taxSummary.tax
  };
}
