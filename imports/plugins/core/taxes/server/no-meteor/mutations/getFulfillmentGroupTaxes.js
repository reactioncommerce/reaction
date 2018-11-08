import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { getActiveTaxServiceForShop } from "../registration";
import { TaxServiceResult } from "../../../lib/simpleSchemas";

/**
 * @summary Modifies a fulfillment group, adding tax-related properties to each item
 *   in the group. Assumes that each item has `subtotal` and `isTaxable` props set. Assumes
 *   that the group has `shopId` and `address` properties set. No-op if the `reaction-taxes`
 *   plugin is disabled or a shipping address hasn't yet been set.
 * @param {Object} context App context
 * @param {Object} group The fulfillment group to get a tax rate for
 * @param {Boolean} forceZeroes Set to `true` to force tax properties to be added
 *   and set to 0 when no tax plugin is enabled. For cart groups, this should be false. For order
 *   groups, this should be true.
 * @returns {Object} Updated fulfillment group
 */
export default async function getFulfillmentGroupTaxes(context, group, forceZeroes) {
  const { address: shippingAddress, items, shopId } = group;

  const activeTaxService = await getActiveTaxServiceForShop(context, shopId);

  if (!shippingAddress || !activeTaxService) {
    if (forceZeroes) {
      return {
        taxSummary: {
          calculatedAt: new Date(),
          tax: 0,
          taxableAmount: 0,
          taxes: []
        },
        items: items.map((item) => ({ ...item, tax: 0, taxableAmount: 0, taxes: [] }))
      };
    }
    return { items, taxSummary: null };
  }

  let taxServiceResult;
  try {
    taxServiceResult = await activeTaxService.functions.calculateOrderGroupTaxes({ context, group });
  } catch (error) {
    Logger.error(`Error in calculateOrderGroupTaxes for the active tax service (${activeTaxService.displayName})`, error);
    throw new ReactionError("internal-error", "Error while calculating taxes");
  }

  try {
    TaxServiceResult.validate(taxServiceResult);
  } catch (error) {
    Logger.error(`Invalid return from calculateOrderGroupTaxes for the active tax service (${activeTaxService.displayName})`, error);
    throw new ReactionError("internal-error", "Error while calculating taxes");
  }

  const { itemTaxes, taxSummary } = taxServiceResult;

  const itemsWithUpdatedTaxProps = items.map((item) => {
    const itemTax = itemTaxes.find((entry) => entry.itemId === item._id) || {};

    return {
      ...item,
      tax: itemTax.tax,
      taxableAmount: itemTax.taxableAmount,
      taxes: itemTax.taxes
    };
  });

  return {
    items: itemsWithUpdatedTaxProps,
    taxSummary
  };
}
