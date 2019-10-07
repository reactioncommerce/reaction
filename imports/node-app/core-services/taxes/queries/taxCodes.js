import { sortBy } from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import { getTaxServicesForShop } from "../registration.js";

/**
 * @name taxCodes
 * @method
 * @memberof Taxes/NoMeteorQueries
 * @summary get list of all registered tax services for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID for which to get tax services
 * @returns {Array<Object>} Array of tax services
 */
export default async function taxCodes(context, shopId) {
  if (!context.userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const { primaryTaxService } = await getTaxServicesForShop(context, shopId);
  if (!primaryTaxService) return [];

  const list = await primaryTaxService.functions.getTaxCodes({ context, shopId });
  return sortBy(list, "label");
}
