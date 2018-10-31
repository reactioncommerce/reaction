import { attributeDenyCheck } from "./attributeDenyCheck";
import { locationAllowCheck } from "./locationAllowCheck";
import { locationDenyCheck } from "./locationDenyCheck";


/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} context - an object containing the per-request state
 * @param {Object} methods - all available shipping methods for a shop
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default async function filterShippingMethods(context, methods, hydratedCart) {
  // const flatRateFulfillmentRestrictionsCollection = getFlatRateFulfillmentRestrictionsCollection(context);
  const flatRateFulfillmentRestrictionsCollection = context.collections.FlatRateFulfillmentRestrictions;

  // Check all methods against location allow check
  const allowedMethodsBasedOnShippingLocationsAllowList = await locationAllowCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart);

  // Check remaining methods against location deny check
  const allowedMethodsBasedOnShippingLocationsDenyList = await locationDenyCheck(flatRateFulfillmentRestrictionsCollection, allowedMethodsBasedOnShippingLocationsAllowList, hydratedCart);

  // Check remaining methods against attribute deny check
  const availableShippingMethods = await attributeDenyCheck(flatRateFulfillmentRestrictionsCollection, allowedMethodsBasedOnShippingLocationsDenyList, hydratedCart);

  // Return all remaining available shipping rates
  return availableShippingMethods;
}
