// import { pick } from "./helpers";

/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} rates - all available shipping rates for a shop
 * @param {Object} shippingAttributes - computed shippingAttributes to for current order
 * @returns {Object|null} available shipping methods after filtered through restrictions
 */
export default function filterShippingAttributes(rates, shippingAttributes) {

  const activeShippingRates = rates.reduce((validShippingRates, rate) => {
    // If rate has no restriction. add it to validShippingRates
    if (!rate.method.restrictions) {
      validShippingRates.push(rate);
      return validShippingRates;
    }

    // If rate does have restrictions, check for further filtration
    console.log("---------- rate has some restrictions", rate.method.name); // TODO: Remove, for testing only

    // Destination restrictions
    const destinationRestriction = rate.method.restrictions.destination;
    if (destinationRestriction) {
      console.log("---------- There is a destination restriction on this item", destinationRestriction);
    }

    // Hazard restrictions
    const hazardRestriction = rate.method.restrictions.hazard;
    if (hazardRestriction) {
      console.log("---------- There is a hazard restriction on this item", hazardRestriction);
    }

    // Return validShippingRates reduced array
    return validShippingRates;
  }, []);

  // Return all activeShippingRates
  console.log("-------------------- activeShippingRates --------------------", activeShippingRates); // TODO: Remove, for testing only
  return activeShippingRates;
}
