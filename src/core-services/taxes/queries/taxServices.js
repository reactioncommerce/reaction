import _ from "lodash";
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
export default async function taxServices(context, shopId) {
  await context.validatePermissions("reaction:legacy:taxes", "read", { shopId });

  const list = Object.values(registeredTaxServices).map((service) => ({
    displayName: service.displayName,
    name: service.name,
    pluginName: service.pluginName
  }));

  return _.sortBy(list, "displayName");
}
