// import { pick } from "./helpers";

/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} rates - all available shipping rates for a shop
 * @param {Object} shippingAttributes - computed shippingAttributes to for current order
 * @returns {Object|null} available shipping methods after filtered through restrictions
 */
export default function filterShippingAttributes(rates, shippingAttributes) {

  const activeShippingRates = rates.reduce((validShippingRates, rate) => {
    console.log("------------------------------ shippingAttributes", shippingAttributes); // TODO: Remove, for testing visibility only

    // Return nothing if rate.method is not sent
    if (!rate && rate.method) return;

    const { method: { restrictions } } = rate;

    // If rate has no restrictions, add it to validShippingRates
    if (!restrictions) {
      validShippingRates.push(rate);
      return validShippingRates;
    }

    // If rate does have restrictions, check for further filtration
    console.log("---------- rate has some restrictions", rate.method.name); // TODO: Remove, for testing visibility only

    // Destination restrictions
    const destinationRestriction = restrictions && restrictions.destination;

    if (destinationRestriction) {
      // Whitelist - If attributes match, we do add it to the list
      // If attributes do not match, we do not add it to the list
      if (destinationRestriction.type === "whitelist") {
        if (destinationRestriction.regions.includes(shippingAttributes.address.region)) {
          validShippingRates.push(rate);
        };
      }

      // Blacklist - If attributes match, we do not add it to the list
      // If attributes do not match, we do add it to the list
      if (destinationRestriction.type === "blacklist") {
        if (!destinationRestriction.regions.includes(shippingAttributes.address.region)) {
          validShippingRates.push(rate);
        };
      }
    }

    // Hazard restrictions
    const hazardRestriction = restrictions && restrictions.hazard;
    if (hazardRestriction) {
      console.log("---------- There is a hazard restriction on this item", hazardRestriction); // TODO: Remove, for testing visibility only
    }

    // Return validShippingRates reduced array
    return validShippingRates;
  }, []);

  // Return all activeShippingRates
  console.log("-------------------- activeShippingRates --------------------", activeShippingRates); // TODO: Remove, for testing visibility only
  return activeShippingRates;
}
