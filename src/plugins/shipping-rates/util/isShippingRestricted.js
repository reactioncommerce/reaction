import operators from "@reactioncommerce/api-utils/operators.js";
import propertyTypes from "@reactioncommerce/api-utils/propertyTypes.js";

/**
 * @summary Filter shipping methods based on global restrictions
 * @param {Object} context - an object containing the per-request state
 * @param {Object} hydratedOrder - computed hydratedOrder for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default async function isShippingRestricted(context, hydratedOrder) {
  const { items, shippingAddress } = hydratedOrder;
  const { FlatRateFulfillmentRestrictions } = context.collections;
  const universalRestrictions = await FlatRateFulfillmentRestrictions.find({ methodIds: null, type: "deny" }).toArray();

  // If there are no universal restrictions, move on to method specific checks
  if (universalRestrictions.length === 0) {
    return false;
  }

  const doItemsContainUniversalRestrictions = items.some((item) => { // eslint-disable-line
    // If any item matches a restriction, restrict method
    return universalRestrictions.some((restriction) => {
      const { attributes, destination } = restriction;

      // If attributes exist, check for attribute matches + attribute && destination matches
      if (attributes && Array.isArray(attributes) && attributes.length) {
        return attributes.some((attribute) => {
          const attributeFound = operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));

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
      }

      if (destination) {
        // There are no attribute restrictions, only check destination restrictions
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

      return false;
    });
  });

  // If restrictions are found, return true
  // If they aren't found, return false
  return doItemsContainUniversalRestrictions;
}
