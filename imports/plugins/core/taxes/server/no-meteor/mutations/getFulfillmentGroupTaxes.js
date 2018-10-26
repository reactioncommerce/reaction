import { taxServices } from "../registration";

/**
 * @param {Object} context The app context
 * @param {String} shopId The shop ID
 * @returns {Object|null} The definition from registerPackage for the tax service that is
 *   currently enabled for the shop with ID `shopId`
 */
async function getActiveTaxServiceForShop(context, shopId) {
  const plugin = await context.collections.Packages.findOne({ name: "reaction-taxes", shopId });
  if (!plugin) return null;

  const { activeTaxServiceName } = plugin.settings || {};
  if (!activeTaxServiceName) return null;

  const config = taxServices[activeTaxServiceName];
  if (!config) {
    throw new Error(`Active tax service is "${activeTaxServiceName}" but no such service exists. ` +
      "Did you forget to install the plugin that provides this service?");
  }

  return config;
}

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
