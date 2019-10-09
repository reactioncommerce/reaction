import operators from "@reactioncommerce/api-utils/operators.js";
import propertyTypes from "@reactioncommerce/api-utils/propertyTypes.js";

/**
 * @summary Filter shipping methods based on per method deny attribute restrictions
 * @param {Object} methodRestrictions - method restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} method - current method to check restrcictions against
 * @param {Object} hydratedOrder - hydrated order for current order
 * @returns {Bool} true / false as to whether method is still valid after this check
 */
export async function attributeDenyCheck(methodRestrictions, method, hydratedOrder) {
  // Get method specific attribute deny restrictions
  const attributesDenyRestrictions = methodRestrictions.filter((restriction) => restriction.type === "deny" && Array.isArray(restriction.attributes));

  // If there are no attributes deny restrictions, this method is valid at this point
  if (attributesDenyRestrictions.length === 0) return true;

  const { items, shippingAddress } = hydratedOrder;

  const denyMethod = items.some((item) => { // eslint-disable-line
    // For each item, run through the restrictions
    return attributesDenyRestrictions.some((methodRestriction) => {
      const { attributes, destination } = methodRestriction;

      // Item must meet all attributes to be restricted
      return attributes.every((attribute) => {
        let attributeFound = operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));

        // If attribute is an array on the item, use `includes` instead of checking for ===
        // This works for tags, tagIds, and any future attribute that might be an array
        if (Array.isArray(item[attribute.property])) {
          attributeFound = item[attribute.property].includes(attribute.value);
        }

        if (attributeFound) {
          // If there is no destination restriction, destination restriction is global
          // Return true to restrict this method
          if (!destination) return attributeFound;

          const { country: restrictionCountry, postal: restrictionPostal, region: restrictionRegion } = destination;

          if (restrictionPostal && restrictionPostal.includes(shippingAddress.postal)) {
            return true;
          }

          // Check for an allow list of regions
          if (restrictionRegion && restrictionRegion.includes(shippingAddress.region)) {
            return true;
          }

          // Check for an allow list of countries
          if (restrictionCountry && restrictionCountry.includes(shippingAddress.country)) {
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
