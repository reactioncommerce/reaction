import { operators, propertyTypes } from "./helpers";


/**
 * @summary Filter shipping methods based on per method attribute restrictions
 * @param {Object} availableShippingMethods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function attributeDenyCheck(availableShippingMethods, hydratedCart) {
  return availableShippingMethods.reduce((validShippingMethods, method) => {
    const { items } = hydratedCart;
    const { restrictions: { deny: { attributes } } } = method;

    // console.log("-------------------- made it past location deny List check, checking for attribute deny list check now--------------------", method.method.name);


    // If there are not attribute restrtions, then method is unrestricted
    if (!attributes || !Array.isArray(attributes) || !attributes.length) {
      validShippingMethods.push(method);
      return validShippingMethods;
    }


    items.reduce((itemCheck, item) => {
      // If any item matches a restriction, restrict method
      const foundRestrictedProperty = attributes.some((attribute) => {

        // If a propertyType is not present, or does not match a predefined `propertyTypes`
        // return true and make method restricted
        // if (!attributes.propertyType || !Object.keys(propertyTypes).includes(attributes.propertyType)) {
        //   return true;
        // }

        return operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));
      });


      if (!foundRestrictedProperty) {
        validShippingMethods.push(method);
      }

      return validShippingMethods;
    }, [])


    return validShippingMethods;
  }, [])
}



















/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} methods - all available shipping methods for a shop
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default function filterShippingAttributes(methods, hydratedCart) {
  // const { items: hydratedItems, destination } = hydratedCart;
  const allowedMethodsBasedOnShippingLocationsAllowList = methods.reduce((validShippingRates, method) => {
    // Return nothing if there is no method on the method
    if (!method.enabled) {
      return validShippingRates;
    }

    const { restrictions } = method;

    // console.log("-------------------- first check, all (10) methods should produce this log --------------------", method.method.name);

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

  // Run remaining available methods through the deny
  const allowedMethodsBasedOnShippingLocationsDenyList = allowedMethodsBasedOnShippingLocationsAllowList.reduce((validShippingRates, method) => {
    const { restrictions } = method;

    // If method does not have deny restrictions, add it to the available methods
    if (restrictions && !restrictions.deny) {
      validShippingRates.push(method);
      return validShippingRates;
    }

    // There is a deny object on the shipping method (there always should be)
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


  // Run remaining shipping rates list through attribute deny check
  const reducedShippingRates = attributeDenyCheck(allowedMethodsBasedOnShippingLocationsDenyList, hydratedCart);

  // console.log("-------------------- reducedShippingRates --------------------", reducedShippingRates); // TODO: remove log, for testing only

  // Return all remaining availalbe shipping rates
  return reducedShippingRates;
}
