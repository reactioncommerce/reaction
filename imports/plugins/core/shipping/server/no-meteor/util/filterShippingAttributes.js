// import { pick } from "./helpers";

/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} rates - all available shipping rates for a shop
 * @param {Object} shippingAttributes - computed shippingAttributes to for current order
 * @returns {Object|null} available shipping methods after filtered through restrictions
 */
export default function filterShippingAttributes(rates, shippingAttributes) {

  const activeShippingRates = rates.reduce((validShippingRates, rate) => {
    console.log("------------------------------ shippingAttributes", shippingAttributes);

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
      // Whitelist - We add it to the list if attributes match
      if (destinationRestriction.type === "whitelist") {
        console.log("---------- This is a whitelist match, meaning we add the shipping method if it matches");
        if (destinationRestriction.regions.includes(shippingAttributes.address.region)) {
          console.log("---------- IT WORKSSSSSSSSSSSSSSSSS");
          validShippingRates.push(rate);
        };
      }
      // Whitelist - We don't add it to the list if attributes match
      if (destinationRestriction.type === "blacklist") {
        console.log("---------- This is a blacklist match, meaning we add the shipping method if it does not match");
        if (!destinationRestriction.regions.includes(shippingAttributes.address.region)) {
          console.log("---------- IT WORKSSSSSSSSSSSSSSSSS for blacklists toooooooooooo");
          validShippingRates.push(rate);
        };
      }
    }

    // // Hazard restrictions
    // const hazardRestriction = rate.method.restrictions.hazard;
    // if (hazardRestriction) {
    //   console.log("---------- There is a hazard restriction on this item", hazardRestriction);
    // }

    // Return validShippingRates reduced array
    return validShippingRates;
  }, []);

  // Return all activeShippingRates
  console.log("-------------------- activeShippingRates --------------------", activeShippingRates); // TODO: Remove, for testing only
  return activeShippingRates;
}






// const activeMethods = [];
  // const inactiveMethods = [];


  // if (shippingAttributes.address.region === "AK") {
  //   console.log("---------- WE ARE SHIPPING TO ALASKA");
  //   activeMethods.push("Alaska");
  // }
  // if (shippingAttributes.address.region === "HI") {
  //   console.log("---------- WE ARE SHIPPING TO HAWAII");
  //   activeMethods.push("Hawaii");
  // }
  // if (shippingAttributes.address.region !== "AK" && shippingAttributes.address.region !== "HI") {
  //   console.log("---------- WE ARE SHIPPING TO THE CONTIGUOUS UNITED STATES");
  //   inactiveMethods.push("Alaska");
  //   inactiveMethods.push("Hawaii");
  // }

  // const allMethods = rates.map((item) => item.method.name);

  // // const newRates = rates;
  // let newRates = rates.filter((item) => allMethods.includes(item.method.name));
  // if (activeMethods && activeMethods.length) {
  //   newRates = rates.filter((item) => activeMethods.includes(item.method.name));
  // }

  // if (inactiveMethods && !activeMethods.length) {
  //   newRates = rates.filter((item) => !inactiveMethods.includes(item.method.name));
  // }

  // return newRates;
