// import { pick } from "./helpers";

/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} rates - all available shipping rates for a shop
 * @param {Object} shippingAttributes - computed shippingAttributes to for current order
 * @returns {Object|null} available shipping methods after filtered through restrictions
 */
export default function filterShippingAttributes(rates, shippingAttributes) {

  console.log("---------- shippingAttributes for current order", shippingAttributes);

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

  // Return all activeShippingRates
  console.log("-------------------- activeShippingRates --------------------", activeShippingRates); // TODO: Remove, for testing visibility only
  return activeShippingRates;
  console.log("-------------------- availableShippingRates --------------------", availableShippingRates); // TODO: Remove, for testing visibility only

  // Return all remaining availalbe shipping rates
  return availableShippingRates;
}
