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


  console.log("---------- available shipping rates after running through whitelist check", whiteListShippingRates); // TODO: remove log, for testing only


  // Run remaining available rates through the blacklist
  const availableShippingRates = whiteListShippingRates.reduce((stillValidShippingRates, rate) => {

    const { method: { restrictions } } = rate;

    // If rate does not have blacklist restrictions, add it to the available rates
    if (restrictions && !restrictions.blacklist) {
      console.log("---------- there are no blacklists, add rate to list", rate.method.name);

      stillValidShippingRates.push(rate);
      return stillValidShippingRates;
    }

    // There is a blacklist object on the shipping method (there always should be)
    // Check to see if anything matches

    const { blacklist: { destination } } = restrictions;

    // If country blacklist exists, use this
    if (destination && destination.country && destination.country.includes(shippingAttributes.address.country)) {
      console.log("---------- there is a COUNTRY blacklist for this method", rate.method.name, destination);
      return stillValidShippingRates;
    }

    // If region blacklist exists, use this if there is no country blacklist
    if (destination && destination.region && destination.region.includes(shippingAttributes.address.region)) {
      console.log("---------- there is a REGION blacklist for this method", rate.method.name, destination);
      return stillValidShippingRates;
    }

    // If postal code blacklist exists, use this if there is no country or region blacklist
    if (destination && destination.postal && destination.postal.includes(shippingAttributes.address.postal)) {
      console.log("---------- there is a POSTAL blacklist for this method", rate.method.name, destination);
      return stillValidShippingRates;
    }

    console.log("---------- there are no country, region, or postal blacklists for this method", rate.method.name);


    // If it passes all the blacklist restrictions, add add it to the list of available rates
    stillValidShippingRates.push(rate);
    return stillValidShippingRates;
  }, []);


  console.log("-------------------- availableShippingRates --------------------", availableShippingRates); // TODO: remove log, for testing only

  // Return all remaining availalbe shipping rates
  return availableShippingRates;
}
