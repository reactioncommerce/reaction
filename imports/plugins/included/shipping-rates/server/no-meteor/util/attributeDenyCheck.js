import { operators, propertyTypes } from "./helpers";


/**
 * @summary Filter shipping methods based on per method allow location restrictions
 * @param {Object} methodRestrictions - method restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} method - current method to check restrcictions against
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Bool} true / false as to whether method is still valid after this check
 */
export async function attributeDenyCheck(methodRestrictions, method, hydratedCart) {
  // Get method specific allow restrictions
  const denyRestrictions = methodRestrictions.filter((methodRestriction) => methodRestriction.type === "deny");

  // Check to see if any restrictions for this method are attributes restrictions
  const attributesRestrictions = denyRestrictions.some((restriction) => restriction.attributes !== null);

  // If there are no attributes deny restrictions, this method is valid at this point
  if (!attributesRestrictions) {
    return true;
  }

  const { items } = hydratedCart;

  const denyMethod = items.some((item) => { // eslint-disable-line
    // For each item, run through the restrictions
    return methodRestrictions.some((methodRestriction) => {
      const { attributes, destination } = methodRestriction;

      // If there is no destination restriction on this method, it is valid at this point
      if (!attributes) {
        return false;
      }

      // Item must meet all attributes to be restricted
      return attributes.every((attribute) => {
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

  return !denyMethod;
}
