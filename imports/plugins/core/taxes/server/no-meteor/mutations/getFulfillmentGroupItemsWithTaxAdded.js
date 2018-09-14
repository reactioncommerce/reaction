/**
 * @summary Gets the tax rate as a percent based on shop ID and shipping address of a fulfillment group
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} group The fulfillment group to get a tax rate for
 * @returns {Number} Tax percent, e.g., 1 means 1%
 */
async function getTaxPercentForShop(collections, group) {
  const { Packages, Taxes } = collections;
  const { address: shippingAddress, shopId } = group;

  // TODO: Calculate shipping taxes for regions that require it
  const pkg = await Packages.findOne({ shopId, name: "reaction-taxes" });
  if (!pkg || !pkg.enabled || !pkg.settings.rates.enabled) {
    return 0;
  }

  if (!shippingAddress) return 0;

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
  if (!taxDoc) return 0;

  return taxDoc.rate || 0;
}

/**
 * @summary Modifies a fulfillment group, adding `taxRate` and `tax` properties to each item
 *   in the group. Assumes that each item has `subtotal` and `isTaxable` props set. Assumes
 *   that the group has `shopId` and `address` properties set.
 * @param {Object} collections Map of MongoDB collections
 * @param {Object} group The fulfillment group to get a tax rate for
 * @returns {Object} Updated fulfillment group
 */
export default async function getFulfillmentGroupItemsWithTaxAdded(collections, group) {
  const { items } = group;

  const taxPercent = await getTaxPercentForShop(collections, group);
  const taxRate = taxPercent / 100;

  // calculate line item taxes
  const itemsWithTax = items.map((item) => {
    // init rate to 0
    item.taxRate = 0;
    item.tax = 0;

    // only process taxable products and skip if there is no shopTaxData
    if (taxRate && item.isTaxable) {
      item.taxRate = taxRate;
      item.tax = item.subtotal * item.taxRate;
    }

    return item;
  });

  return itemsWithTax;
}
