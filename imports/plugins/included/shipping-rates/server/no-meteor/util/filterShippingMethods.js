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
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function locationAllowCheck(methods, hydratedCart) {
  // Check all methods against location allow check
  return methods.reduce((validShippingRates, method) => {
    // Return nothing if there is no method on the method
    if (!method.enabled) {
      return validShippingRates;
    }

    const { restrictions } = method;

    // If method has no restrictions, add method to validShippingRates
    if (!restrictions) {
      validShippingRates.push(method);
      return validShippingRates;
    }

    // If method does have allow list, check for further filtration
    if (restrictions && restrictions.allow) {
      const { allow: { destination } } = restrictions;

      // If there is no allow.destination list, add method to validShippingRates
      // We don't have an allow.attributes list
      if (!destination) {
        validShippingRates.push(method);
        return validShippingRates;
      }

      // Start checking at the micro-level, and move more macro as we go on

      // Check for an allow list of postal codes
      if (destination.postal && destination.postal.includes(hydratedCart.address.postal)) {
        validShippingRates.push(method);
        return validShippingRates;
      }

      // Check for an allow list of regions
      if (destination.region && destination.region.includes(hydratedCart.address.region)) {
        validShippingRates.push(method);
        return validShippingRates;
      }

      // Check for an allow list of countries
      if (destination.country && destination.country.includes(hydratedCart.address.country)) {
        validShippingRates.push(method);
        return validShippingRates;
      }
    }

    // Return validShippingRates reduced array
    return validShippingRates;
  }, []);
}


/**
 * @summary Filter shipping methods based on per method deny location restrictions
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function locationDenyCheck(methods, hydratedCart) {
  // Run remaining available methods through the location deny check
  return methods.reduce((validShippingRates, method) => {
  // const allowedMethodsBasedOnShippingLocationsDenyList = allowedMethodsBasedOnShippingLocationsAllowList.reduce((validShippingRates, method) => {
    const { restrictions } = method;

    // If method does not have deny restrictions, add it to the available methods
    if (restrictions && !restrictions.deny) {
      validShippingRates.push(method);
      return validShippingRates;
    }

    // There is a deny object on the shipping method (there always should be at this point)
    // Check to see if anything matches
    const { deny: { destination } } = restrictions;

    // If country deny exists, use this
    if (destination && destination.country && destination.country.includes(hydratedCart.address.country)) {
      return validShippingRates;
    }

    // If region deny exists, use this if there is no country deny
    if (destination && destination.region && destination.region.includes(hydratedCart.address.region)) {
      return validShippingRates;
    }

    // If postal code deny exists, use this if there is no country or region deny
    if (destination && destination.postal && destination.postal.includes(hydratedCart.address.postal)) {
      return validShippingRates;
    }

    // If it passes all the deny restrictions, add add it to the list of available methods
    validShippingRates.push(method);
    return validShippingRates;
  }, []);
}


/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} methods - all available shipping methods for a shop
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default function filterShippingMethods(methods, hydratedCart) {
  // Check all methods against location allow check
  const allowedMethodsBasedOnShippingLocationsAllowList = locationAllowCheck(methods, hydratedCart);

  // Check remaining methods against location deny check
  const allowedMethodsBasedOnShippingLocationsDenyList = locationDenyCheck(allowedMethodsBasedOnShippingLocationsAllowList, hydratedCart);

  // Check remaining methods against attribute deny check
  const availableShippingMethods = attributeDenyCheck(allowedMethodsBasedOnShippingLocationsDenyList, hydratedCart);

  // Return all remaining available shipping rates
  return availableShippingMethods;
}
