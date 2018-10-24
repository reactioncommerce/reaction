// import { pick } from "./helpers";

/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} rates - all available shipping rates for a shop
 * @param {Object} shippingAttributes - computed shippingAttributes to for current order
 * @returns {Object|null} available shipping methods after filtered through restrictions
 */
export default function filterShippingAttributes(rates, shippingAttributes) {

  console.log("---------- shippingAttributes for current order", shippingAttributes); // TODO: remove log, for testing only

  const whiteListShippingRates = rates.reduce((validShippingRates, rate) => {

    // Return nothing new if rate.method is not sent
    if (!rate && rate.method) return validShippingRates;

    const { method: { restrictions } } = rate;

    // If rate has no restrictions, add rate to validShippingRates
    if (!restrictions) {
      validShippingRates.push(rate);
      return validShippingRates;
    }

    // If rate does have whitelist restrictios, check for further filtration
    if (restrictions && restrictions.whitelist) {
      const { whitelist: { destination } } = restrictions;

      // If there are no destination whitelists, move on
      // We don't have item whitelists, so we can end it here
      if (!destination) {
        validShippingRates.push(rate);
        return validShippingRates;
      }

      // If postal code restrictions exist, use these
      if (destination.postal && destination.postal.includes(shippingAttributes.address.postal)) {
        validShippingRates.push(rate);
        return validShippingRates;
      }

      // If region whitelist exists, use thise if there is no zip code whitelist
      if (destination.region && destination.region.includes(shippingAttributes.address.region)) {
        validShippingRates.push(rate);
        return validShippingRates;
      }

      // If country whitelist exists, use theis if there is no zip code or region whitelist
      if (destination.country && destination.country.includes(shippingAttributes.address.country)) {
        validShippingRates.push(rate);
        return validShippingRates;
      }
    }

    // Return validShippingRates reduced array
    return validShippingRates;
  }, []);

  // Run remaining available rates through the blacklist
  const availableShippingRates = whiteListShippingRates.reduce((stillValidShippingRates, rate) => {

    const { method: { restrictions } } = rate;

    // If rate does not have blacklist restrictions, add it to the available rates
    if (restrictions && !restrictions.blacklist) {
      stillValidShippingRates.push(rate);
      return stillValidShippingRates;
    }

    // There is a blacklist object on the shipping method (there always should be)
    // Check to see if anything matches

    const { blacklist: { destination }, whitelist: { destination: whitelistDestination } } = restrictions;

    // If country blacklist exists, use this
    if (destination && destination.country && destination.country.includes(shippingAttributes.address.country)) {
      return stillValidShippingRates;
    }

    // If region blacklist exists, use this if there is no country blacklist
    if (destination && destination.region && destination.region.includes(shippingAttributes.address.region)) {
      return stillValidShippingRates;
    }

    // If postal code blacklist exists, use this if there is no country or region blacklist
    if (destination && destination.postal && destination.postal.includes(shippingAttributes.address.postal)) {
      return stillValidShippingRates;
    }

    // If it passes all the blacklist restrictions, add add it to the list of available rates
    stillValidShippingRates.push(rate);
    return stillValidShippingRates;
  }, []);



  const availableMethodsAfterItemBlacklist = availableShippingRates.reduce((finalShippingRates, rate) => {
    const { items } = shippingAttributes;
    const { method: { restrictions: { blacklist: { attributes }}}} = rate;

    // If there are not attribute restrtions, then method is unrestricted
    if (!attributes || !Array.isArray(attributes) || !attributes.length) {
      finalShippingRates.push(rate);
      return finalShippingRates;
    }

    const operators = {
      "eq": function(a, b) { return a === b},
      "gt": function(a, b) { return a > b},
      "lt": function(a, b) { return a < b },
      "ne": function(a, b) { return a !== b}
    };

    const propertyTypes = {
      "bool": function(a) { return a === "true" },
      "float": function(a) { return parseFloat(a) },
      "int": function(a) { return parseInt(a) },
      "string": function(a) { return a }
    }



    const remainingItems = items.reduce((itemCheck, item) => {



      const foundRestrictedProperty = attributes.find((attribute) => {

        // If a propertyType is not present, or does not match a predefined `propertyTypes`
        // return true and make method restricted
        if (!attributes.propertyType || !Object.keys(propertyTypes).includes(attributes.propertyType)) {
          return true;
        }



        console.log("attribute", attribute);
        return operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value))
      });


      if (!foundRestrictedProperty) {
        finalShippingRates.push(rate);
      }

      return finalShippingRates;
    }, [])


    return finalShippingRates;
  }, [])

  console.log("-------------------- availableShippingRates --------------------", availableMethodsAfterItemBlacklist); // TODO: remove log, for testing only

  // Return all remaining availalbe shipping rates
  return availableMethodsAfterItemBlacklist;
}
