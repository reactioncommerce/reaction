import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { getTaxServicesForShop } from "../registration.js";
import { TaxServiceResult } from "../simpleSchemas.js";

/**
 * @summary Returns all taxes that apply to a provided order, delegating to a more specific
 *   tax calculation service for the actual calculations.
 * @param {Object} context App context
 * @param {Object} order Relevant information about an order. This is similar to an OrderFulfillmentGroup type.
 * @param {Boolean} forceZeroes Set to `true` to force tax properties to be added
 *   and set to 0 when no tax plugin is enabled. When calculating tax for a cart, this should be false.
 *   When calculating tax for an order, this should be true.
 * @returns {Object} Calculated tax information. Has `taxSummary` property in `TaxSummary` schema
 *   as well as `itemTaxes` array property with `itemId`, `tax`, `taxableAmount`,
 *   and `taxes` properties on each array item.
 */
export default async function getFulfillmentGroupTaxes(context, { order, forceZeroes }) {
  const { items, shopId } = order;

  const { primaryTaxService, fallbackTaxService } = await getTaxServicesForShop(context, shopId);

  const defaultReturnValue = {
    taxSummary: {
      calculatedAt: new Date(),
      tax: 0,
      taxableAmount: 0,
      taxes: []
    },
    itemTaxes: items.map((item) => ({ itemId: item._id, tax: 0, taxableAmount: 0, taxes: [] }))
  };

  if (!primaryTaxService) {
    return forceZeroes ? defaultReturnValue : { itemTaxes: [], taxSummary: null };
  }

  let taxServiceResult;
  try {
    taxServiceResult = await primaryTaxService.functions.calculateOrderTaxes({ context, order });
  } catch (error) {
    Logger.error(`Error in calculateOrderTaxes for the primary tax service (${primaryTaxService.displayName})`, error);
    throw new ReactionError("internal-error", "Error while calculating taxes");
  }

  // The tax service may return `null` if it can't calculate due to missing info
  if (!taxServiceResult && fallbackTaxService) {
    // if primaryTaxService returns null, try the fallbackTaxService before falling back to forceZeroTax (if set)
    Logger.info("Primary tax service calculation returned null. Using set fallback tax service");
    try {
      taxServiceResult = await fallbackTaxService.functions.calculateOrderTaxes({ context, order });
    } catch (fallbackError) {
      Logger.error(`Error in calculateOrderTaxes for the fallback tax service (${fallbackTaxService.displayName})`, fallbackError);
      throw new ReactionError("internal-error", "Error while calculating taxes");
    }
  }

  // if none of primary and fallback services returns valid tax response, default to zero or empty
  if (!taxServiceResult) {
    return forceZeroes ? defaultReturnValue : { itemTaxes: [], taxSummary: null };
  }

  try {
    TaxServiceResult.validate(taxServiceResult);
  } catch (error) {
    Logger.error("Invalid return from the calculateOrderTaxes function", error);
    throw new ReactionError("internal-error", "Error while calculating taxes");
  }

  return taxServiceResult;
}
