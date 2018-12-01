import { attributeDenyCheck } from "./attributeDenyCheck";
import { locationAllowCheck } from "./locationAllowCheck";
import { locationDenyCheck } from "./locationDenyCheck";


/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} context - an object containing the per-request state
 * @param {Object} methods - all available shipping methods for a shop
 * @param {Object} hydratedOrder - hydrated order for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default async function filterShippingMethods(context, methods, hydratedOrder) {
  const flatRateFulfillmentRestrictionsCollection = context.collections.FlatRateFulfillmentRestrictions;

  const allValidShippingMethods = methods.reduce(async (validShippingMethods, method) => {
    const awaitedValidShippingMethods = await validShippingMethods;

    // If method is not enabled, it is not valid
    if (!method.enabled) {
      return awaitedValidShippingMethods;
    }

    // Find all restrictions for this shipping method
    const methodRestrictions = await flatRateFulfillmentRestrictionsCollection.find({ methodIds: method._id }).toArray();

    // Check method against location allow check
    const allowedMethodBasedOnShippingLocationsAllowList = await locationAllowCheck(methodRestrictions, method, hydratedOrder);

    // Check method against location deny check
    const allowedMethodsBasedOnShippingLocationsDenyList = await locationDenyCheck(methodRestrictions, method, hydratedOrder);

    // Check method against attributes deny check
    const allowedMethodsBasedOnShippingAttributesDenyList = await attributeDenyCheck(methodRestrictions, method, hydratedOrder);

    // If method passes all checks, it is valid and should be added to valid methods array
    if (allowedMethodBasedOnShippingLocationsAllowList && allowedMethodsBasedOnShippingLocationsDenyList && allowedMethodsBasedOnShippingAttributesDenyList) {
      awaitedValidShippingMethods.push(method);
    }

    return awaitedValidShippingMethods;
  }, Promise.resolve([]));

  // Return all valid shipping rates
  return allValidShippingMethods;
}
