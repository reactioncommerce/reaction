import Random from "@reactioncommerce/random";

/**
 * @summary Gets all applicable tax definitions based on shop ID and shipping address of a fulfillment group
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} group The fulfillment group to get a tax definitions for
 * @returns {Object[]} Array of tax definition docs
 */
async function getTaxesForShop(collections, group) {
  const { Taxes } = collections;
  const { address: shippingAddress, shopId } = group;

  // Find all defined taxes where the shipping address is a match
  const taxDocs = await Taxes.find({
    shopId,
    taxLocale: "destination",
    $or: [{
      postal: shippingAddress.postal
    }, {
      postal: null,
      region: shippingAddress.region,
      country: shippingAddress.country
    }, {
      postal: null,
      region: null,
      country: shippingAddress.country
    }]
  }).toArray();

  // Rate is entered and stored in the database as a percent. Convert to ratio.
  // Also add a name. Someday should allow a shop operator to enter the name.
  return taxDocs.map((doc) => ({
    ...doc,
    rate: doc.rate / 100,
    name: `${doc.postal || ""} ${doc.region || ""} ${doc.country || ""}`.trim().replace(/\s\s+/g, " ")
  }));
}

/**
 * @summary Modifies a fulfillment group, adding `taxRate` and `tax` properties to each item
 *   in the group. Assumes that each item has `subtotal` and `isTaxable` props set. Assumes
 *   that the group has `shopId` and `address` properties set. No-op if the `reaction-taxes`
 *   package is disabled or a shipping address hasn't yet been set.
 * @param {Object} context App context
 * @param {Object} group The fulfillment group to get a tax rate for
 * @returns {Object} Updated fulfillment group
 */
export default async function calculateOrderGroupTaxes({ context, group }) {
  const { items } = group;

  const allTaxes = await getTaxesForShop(context.collections, group);

  /**
   * @param {Object} item The item
   * @returns {Object[]} applicable taxes for one item, in the `taxes` schema
   */
  function taxesForItem(item) {
    if (!item.isTaxable) return [];

    return allTaxes
      .filter((taxDef) => taxDef.taxCode === item.taxCode)
      .map((taxDef) => ({
        _id: Random.id(),
        jurisdictionId: taxDef._id,
        sourcing: taxDef.taxLocale,
        tax: item.subtotal * taxDef.rate,
        taxableAmount: item.subtotal,
        taxName: taxDef.name,
        taxRate: taxDef.rate
      }));
  }

  // calculate line item taxes
  let totalTaxableAmount = 0;
  let totalTax = 0;
  const groupTaxes = {};
  const itemTaxes = items.map((item) => {
    if (typeof item.subtotal !== "number") {
      throw new Error("item.subtotal is missing");
    }

    const taxes = taxesForItem(item);

    // Update the group taxes list
    taxes.forEach((taxDef) => {
      const { jurisdictionId } = taxDef;
      if (groupTaxes[jurisdictionId]) {
        groupTaxes[jurisdictionId].tax += taxDef.tax;
        groupTaxes[jurisdictionId].taxableAmount += taxDef.taxableAmount;
      } else {
        groupTaxes[jurisdictionId] = {
          ...taxDef,
          _id: Random.id()
        };
      }
    });

    // The taxable amount for the item as a whole is the maximum amount that was
    // taxed by any of the found tax jurisdictions.
    const itemTaxableAmount = taxes.reduce((maxTaxableAmount, taxDef) => {
      if (taxDef.taxableAmount > maxTaxableAmount) return taxDef.taxableAmount;
      return maxTaxableAmount;
    }, 0);
    totalTaxableAmount += itemTaxableAmount;

    // The tax for the item as a whole is the sum of all applicable taxes.
    const itemTax = taxes.reduce((sum, taxDef) => sum + taxDef.tax, 0);
    totalTax += itemTax;

    return {
      itemId: item._id,
      tax: itemTax,
      taxableAmount: itemTaxableAmount,
      taxes
    };
  });

  // Eventually tax shipping as and where necessary here. Not yet implemented.

  return {
    itemTaxes,
    taxSummary: {
      calculatedAt: new Date(),
      tax: totalTax,
      taxableAmount: totalTaxableAmount,
      taxes: Object.values(groupTaxes)
    }
  };
}
