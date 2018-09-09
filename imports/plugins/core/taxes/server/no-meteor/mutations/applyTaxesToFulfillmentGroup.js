/**
 *
 */
export default async function applyTaxesToFulfillmentGroup(collections, group) {
  const { Packages, Taxes } = collections;
  const { address: shippingAddress, items, shopId } = group;

  // TODO: Calculate shipping taxes for regions that require it
  const pkg = await Packages.findOne({ shopId, name: "reaction-taxes" });
  if (!pkg || !pkg.enabled || !pkg.settings.rates.enabled) {
    return group;
  }

  if (!shippingAddress) return group;

  // custom rates that match shipping info
  // high chance this needs more review as
  // it's unlikely this matches all potential
  // here we just sort by postal, so if it's an exact
  // match we're taking the first record, where the most
  // likely tax scenario is a postal code falling
  // back to a regional tax.
  const taxDoc = Taxes.findOne({
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
  if (!taxDoc) return group;

  const shopTaxRate = taxDoc.rate / 100;

  // calculate line item taxes
  let totalTax = 0;
  let itemTotal = 0;
  const itemsWithTax = items.map((item) => {
    itemTotal += item.subtotal;

    // init rate to 0
    item.taxRate = 0;
    item.tax = 0;

    // only process taxable products and skip if there is no shopTaxData
    if (taxDoc && item.isTaxable) {
      item.taxRate = shopTaxRate;
      item.tax = item.subtotal * item.taxRate;
      totalTax += item.tax;
    }

    return item;
  });

  const effectiveTaxRate = itemTotal > 0 && totalTax > 0 ? totalTax / itemTotal : 0;

  return {
    ...group,
    effectiveTaxRate,
    items: itemsWithTax
  };
}
