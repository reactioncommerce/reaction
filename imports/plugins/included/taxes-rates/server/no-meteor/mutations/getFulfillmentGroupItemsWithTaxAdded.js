/**
 * @summary Gets the tax rate based on shop ID and shipping address of a fulfillment group
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} group The fulfillment group to get a tax rate for
 * @returns {Number|null} Tax rate, e.g., 0.01 means 1%
 */
async function getTaxRateForShop(collections, group) {
  const { Packages, Taxes } = collections;
  const { address: shippingAddress, shopId } = group;

  // TODO: Calculate shipping taxes for regions that require it
  const pkg = await Packages.findOne({ shopId, name: "reaction-taxes-rates" });
  if (!pkg || !pkg.enabled || !pkg.settings.rates.enabled) {
    return null;
  }

  if (!shippingAddress) return null;

  // custom rates that match shipping info
  // high chance this needs more review as
  // it's unlikely this matches all potential
  // here we just sort by postal, so if it's an exact
  // match we're taking the first record, where the most
  // likely tax scenario is a postal code falling
  // back to a regional tax.
  const taxDoc = await Taxes.findOne({
    $and: [{
      $or: [{
        postal: shippingAddress.postal
      }, {
        postal: { $exists: false },
        region: shippingAddress.region,
        country: shippingAddress.country
      }, {
        postal: { $exists: false },
        region: { $exists: false },
        country: shippingAddress.country
      }]
    }, {
      shopId
    }]
  }, { sort: { postal: -1 } });

  // Here we return 0 rather than null because the package was enabled and we had enough
  // information to calculate, but no tax jurisdictions matched.
  if (!taxDoc || !taxDoc.rate) return 0;

  // Rate is entered and stored in the database as a percent. Convert to ratio.
  return taxDoc.rate / 100;
}

/**
 * @summary Modifies a fulfillment group, adding `taxRate` and `tax` properties to each item
 *   in the group. Assumes that each item has `subtotal` and `isTaxable` props set. Assumes
 *   that the group has `shopId` and `address` properties set. No-op if the `reaction-taxes`
 *   package is disabled or a shipping address hasn't yet been set.
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} group The fulfillment group to get a tax rate for
 * @param {Boolean} forceZeroes Set to `true` to force `taxRate` and `tax` properties to be added
 *   and set to 0 when no tax package is enabled. For cart groups, this should be false. For order
 *   groups, this should be true.
 * @returns {Object} Updated fulfillment group
 */
export default async function getFulfillmentGroupItemsWithTaxAdded(collections, group, forceZeroes) {
  const { items } = group;

  let taxRate = await getTaxRateForShop(collections, group);

  // The `reaction-taxes-rates` package is disabled or a shipping address hasn't yet been set
  if (taxRate === null) {
    if (!forceZeroes) return items;
    taxRate = 0;
  }

  // calculate line item taxes
  return items.map((item) => {
    // only taxable products with subtotals on them
    if (item.isTaxable && typeof item.subtotal === "number") {
      return {
        ...item,
        taxRate,
        tax: item.subtotal * taxRate
      };
    }

    return {
      ...item,
      taxRate: 0,
      tax: 0
    };
  });
}
