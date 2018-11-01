/**
 * @summary Filter shipping methods based on per method allow location restrictions
 * @param {Object} flatRateFulfillmentRestrictionsCollection - restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export async function locationAllowCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart) {
  // Check all methods against location allow check
  return methods.reduce(async (validShippingMethods, method) => {
    const awaitedValidShippingMethods = await validShippingMethods;

    // If method is not enabled, it is not valid
    if (!method.enabled) {
      return awaitedValidShippingMethods;
    }

    // Get method specific allow restrictions
    const methodRestrictions = await flatRateFulfillmentRestrictionsCollection.find({ methodIds: method._id, type: "allow" }).toArray();

    // Check to see if any restrictions for this method are destination restrictions
    const destinationRestrictions = methodRestrictions.some((restriction) => restriction.destination !== null);

    // If there are no destination allow restrictions, this method is valid at this point
    if (!destinationRestrictions) {
      awaitedValidShippingMethods.push(method);
      return awaitedValidShippingMethods;
    }

    // Loop over each restriction and determine if this method is valid
    methodRestrictions.forEach((methodRestriction) => {
      const { destination } = methodRestriction;

      // Start checking at the micro-level, and move more macro as we go on
      // Check for an allow list of postal codes
      if (destination.postal && destination.postal.includes(hydratedCart.address.postal)) {
        awaitedValidShippingMethods.push(method);
        return awaitedValidShippingMethods;
      }

      // Check for an allow list of regions
      if (destination.region && destination.region.includes(hydratedCart.address.region)) {
        awaitedValidShippingMethods.push(method);
        return awaitedValidShippingMethods;
      }

      // Check for an allow list of countries
      if (destination.country && destination.country.includes(hydratedCart.address.country)) {
        awaitedValidShippingMethods.push(method);
        return awaitedValidShippingMethods;
      }
    });

    return awaitedValidShippingMethods;
  }, Promise.resolve([]));
}
