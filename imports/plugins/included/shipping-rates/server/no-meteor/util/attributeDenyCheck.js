import { operators, propertyTypes } from "./helpers";

/**
 * @summary Filter shipping methods based on per method attribute restrictions
 * @param {Object} flatRateFulfillmentRestrictionsCollection - restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export async function attributeDenyCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart) {
  return methods.reduce(async (validShippingMethods, method) => {
    const awaitedValidShippingMethods = await validShippingMethods;
    const { items } = hydratedCart;

    // Get method specific allow restrictions
    const methodRestrictions = await flatRateFulfillmentRestrictionsCollection.find({ methodIds: method._id, type: "deny" }).toArray();

    // Check to see if any restrictions for this method are destination restrictions
    const attributeRestrictions = methodRestrictions.some((restriction) => restriction.attributes && restriction.attributes.length);

    // If there are no destination allow restrictions, this method is valid at this point
    if (!attributeRestrictions) {
      awaitedValidShippingMethods.push(method);
      return awaitedValidShippingMethods;
    }

    const denyMethod = items.some((item) => {
      // For each item, run through the restrictions
      return methodRestrictions.some((methodRestriction) => {
        const { attributes, destination } = methodRestriction;
        return attributes.some((attribute) => {
          const attributeFound = operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));

          if (attributeFound) {
            // If there is no destination restriction, destination restriction is global
            // Return true to restrict this method
            if (!destination) return attributeFound;

            const { country: restrictionCountry, postal: restrictionPostal, region: restrictionRegion } = destination;

            if (restrictionPostal && restrictionPostal.includes(hydratedCart.address.postal)) {
              return true;
            }

            // Check for an allow list of regions
            if (restrictionRegion && restrictionRegion.includes(hydratedCart.address.region)) {
              return true;
            }

            // Check for an allow list of countries
            if (restrictionCountry && restrictionCountry.includes(hydratedCart.address.country)) {
              return true;
            }
          }

          // If shipping location does not match restricted location && attribute, method is not restricted
          return false;
        });
      });
    });

    // If it passes all the deny restrictions, add it to the list of available methods
    if (!denyMethod) {
      awaitedValidShippingMethods.push(method);
    }

    return awaitedValidShippingMethods;
  }, Promise.resolve([]));
}
