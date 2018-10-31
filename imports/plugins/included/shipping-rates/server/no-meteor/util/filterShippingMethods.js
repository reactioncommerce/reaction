import { operators, propertyTypes } from "./helpers";

/**
 * @summary Filter shipping methods based on per method attribute restrictions
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function attributeDenyCheck(methods, hydratedCart) {
  return methods.reduce((validShippingMethods, method) => {
    const { items } = hydratedCart;
    const { restrictions: { deny: { attributes } } } = method;

    // If there are not attribute restrtions, then method is unrestricted
    if (!attributes || !Array.isArray(attributes) || !attributes.length) {
      validShippingMethods.push(method);
      return validShippingMethods;
    }

    items.reduce((itemCheck, item) => {
      // If any item matches a restriction, restrict method
      const foundRestrictedProperty = attributes.some((attribute) => { // eslint-disable-line
        return operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));
      });


      if (!foundRestrictedProperty) {
        validShippingMethods.push(method);
      }

      return validShippingMethods;
    }, []);

    return validShippingMethods;
  }, []);
}


/**
 * @summary Filter shipping methods based on per method allow location restrictions
 * @param {Object} flatRateFulfillmentRestrictionsCollection - restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
async function locationAllowCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart) {
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


/**
 * @summary Filter shipping methods based on per method deny location restrictions
 * @param {Object} flatRateFulfillmentRestrictionsCollection - restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function locationDenyCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart) {
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

  // Return all remaining availalbe shipping rates
  return availableShippingMethods;
}
