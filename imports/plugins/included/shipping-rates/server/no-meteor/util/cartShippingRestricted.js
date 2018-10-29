import { operators, propertyTypes } from "./helpers";

/**
 * @summary Filter shipping methods based on global restrictions
 * @param {Object} shippingAttributes - computed shippingAttributes for current order
 * @param {Object} doc - shipping method document
 * @returns {Object|null} available shipping methods after filtering
 */
export default function cartShippingRestricted(shippingAttributes, doc) {
  const { universalShippingRestrictions } = doc;
  const { deny: { attributes } } = universalShippingRestrictions;
  const { items } = shippingAttributes;

  // If there are no universal restrictions, move on to method specific checks
  if (!universalShippingRestrictions || !attributes || !Array.isArray(attributes) || !attributes.length) {
    return true;
  }

  const doItemsContainGlobalRestrictions = items.some((item) =>
  // If any item matches a restriction, restrict method
    foundRestrictedProperty = attributes.some((attribute) => {
      const attributeFound = operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));

      if (attributeFound) {
        const restrictionDestination = attribute.destination;

        if (!restrictionDestination) return attributeFound; // this will be true

        const { country: restrictionCountry, postal: restrictionPostal, region: restrictionRegion } = restrictionDestination;

        if (restrictionPostal && restrictionPostal.includes(shippingAttributes.address.postal)) {
          return true;
        }

        // Check for an allow list of regions
        if (restrictionRegion && restrictionRegion.includes(shippingAttributes.address.region)) {
          return true;
        }

        // Check for an allow list of countries
        if (restrictionCountry && restrictionCountry.includes(shippingAttributes.address.country)) {
          return true;
        }
      }
    })
  );

  // If restrictions are found, return true
  // If they aren't found, return false
  return doItemsContainGlobalRestrictions;
}
