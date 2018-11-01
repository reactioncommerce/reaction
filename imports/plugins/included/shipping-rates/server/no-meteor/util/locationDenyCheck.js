/**
 * @summary Filter shipping methods based on per method deny location restrictions
 * @param {Object} flatRateFulfillmentRestrictionsCollection - restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export async function locationDenyCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart) {
  // Run remaining available methods through the location deny check
  return methods.reduce(async (validShippingMethods, method) => {
    const awaitedValidShippingMethods = await validShippingMethods;

    // Get method specific deny restrictions
    const methodRestrictions = await flatRateFulfillmentRestrictionsCollection.find({ methodIds: method._id, type: "deny" }).toArray();

    // Check to see if any restrictions for this method are destination restrictions
    const destinationRestrictions = methodRestrictions.some((restriction) => restriction.destination !== null);

    // If there is no destination deny restriction, this method is valid
    if (!destinationRestrictions) {
      awaitedValidShippingMethods.push(method);
      return awaitedValidShippingMethods;
    }

    // Check each restriction for the method
    // If any restriction matches hydratedCart data, this method is not valid
    const denyMethod = methodRestrictions.some((methodRestriction) => {
      const { destination } = methodRestriction;
      // If country deny exists, use this
      if (destination && destination.country && destination.country.includes(hydratedCart.address.country)) {
        return true;
      }

      // If region deny exists, use this if there is no country deny
      if (destination && destination.region && destination.region.includes(hydratedCart.address.region)) {
        return true;
      }

      // If postal code deny exists, use this if there is no country or region deny
      if (destination && destination.postal && destination.postal.includes(hydratedCart.address.postal)) {
        return true;
      }

      return false;
    });

    // If it passes all the deny restrictions, add it to the list of available methods
    if (!denyMethod) {
      awaitedValidShippingMethods.push(method);
    }

    return awaitedValidShippingMethods;
  }, Promise.resolve([]));
}
