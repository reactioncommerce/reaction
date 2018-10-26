import { getActiveTaxServiceForShop } from "../registration";

/**
 * @summary Modifies a fulfillment group, adding `taxRate` and `tax` properties to each item
 *   in the group. Assumes that each item has `subtotal` and `isTaxable` props set. Assumes
 *   that the group has `shopId` and `address` properties set. No-op if the `reaction-taxes`
 *   package is disabled or a shipping address hasn't yet been set.
 * @param {Object} context App context
 * @param {Object} group The fulfillment group to get a tax rate for
 * @param {Boolean} forceZeroes Set to `true` to force `taxRate` and `tax` properties to be added
 *   and set to 0 when no tax package is enabled. For cart groups, this should be false. For order
 *   groups, this should be true.
 * @returns {Object} Updated fulfillment group
 */
export default async function getFulfillmentGroupTaxes(context, group, forceZeroes) {
  const { address: shippingAddress, items, shopId } = group;

  const activeTaxService = await getActiveTaxServiceForShop(context, shopId);

  if (!shippingAddress || !activeTaxService) {
    if (forceZeroes) {
      return {
        fulfillmentTaxRate: 0,
        fulfillmentTax: 0,
        items: items.map((item) => ({ ...item, taxRate: 0, tax: 0 }))
      };
    }
    return { fulfillmentTaxRate: null, fulfillmentTax: null, items };
  }

  const { itemTaxes, fulfillmentTaxes } = await activeTaxService.functions.calculateOrderGroupTaxes({ context, group });

  const itemsWithUpdatedTaxProps = items.map((item) => {
    const itemTax = itemTaxes.find((entry) => entry.itemId === item._id) || {};

    return {
      ...item,
      taxRate: itemTax.taxRate || 0,
      tax: itemTax.tax || 0
    };
  });

  return {
    fulfillmentTaxRate: fulfillmentTaxes.taxRate,
    fulfillmentTax: fulfillmentTaxes.tax,
    items: itemsWithUpdatedTaxProps
  };
}
