import { attributeDenyCheck } from "./attributeDenyCheck.js";
import { locationAllowCheck } from "./locationAllowCheck.js";
import { locationDenyCheck } from "./locationDenyCheck.js";


/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} context - an object containing the per-request state
 * @param {Object} methods - all available shipping methods for a shop
 * @param {Object} hydratedOrder - hydrated order for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default async function filterShippingMethods(context, methods, hydratedOrder) {
  const { FulfillmentRestrictions } = context.collections;

  const allValidShippingMethods = methods.reduce(async (validShippingMethods, method) => {
    const awaitedValidShippingMethods = await validShippingMethods;

    // If method is not enabled, it is not valid
    // if (!method.isEnabled) {
    if (!method.enabled) {
      return awaitedValidShippingMethods;
    }

    // Find all restrictions for this shipping method
    // TODO This 'find' query may need to be fine tuned further to accomodate new/other fulfillment-types
    // which could have restriction entries. The new entries would be part of phase-2
    const methodRestrictions = await FulfillmentRestrictions.find({ methodIds: method._id }).toArray();
    // Check method against location allow check
    const methodIsAllowedBasedOnShippingLocationsAllowList = await locationAllowCheck(methodRestrictions, method, hydratedOrder);
    if (!methodIsAllowedBasedOnShippingLocationsAllowList) return awaitedValidShippingMethods;

    // Check method against location deny check
    const methodIsAllowedBasedOnShippingLocationsDenyList = await locationDenyCheck(methodRestrictions, method, hydratedOrder);
    if (!methodIsAllowedBasedOnShippingLocationsDenyList) return awaitedValidShippingMethods;

    // Check method against attributes deny check
    const methodIsAllowedBasedOnShippingAttributesDenyList = await attributeDenyCheck(methodRestrictions, method, hydratedOrder);
    if (!methodIsAllowedBasedOnShippingAttributesDenyList) return awaitedValidShippingMethods;

    // If method passes all checks, it is valid and should be added to valid methods array
    awaitedValidShippingMethods.push(method);
    return awaitedValidShippingMethods;
  }, Promise.resolve([]));

  // Return all valid shipping rates
  return allValidShippingMethods;
}
