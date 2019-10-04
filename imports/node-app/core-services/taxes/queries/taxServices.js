import { sortBy } from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import { taxServices as registeredTaxServices } from "../registration.js";

/**
 * @name taxServices
 * @method
 * @memberof Taxes/NoMeteorQueries
 * @summary get list of all registered tax services for a shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shop ID for which to get tax services
 * @returns {Array<Object>} Array of tax services
 */
export default function taxServices(context, shopId) {
  if (!context.userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const list = Object.values(registeredTaxServices).map((service) => ({
    displayName: service.displayName,
    name: service.name,
    pluginName: service.pluginName
  }));

  return sortBy(list, "displayName");
}
