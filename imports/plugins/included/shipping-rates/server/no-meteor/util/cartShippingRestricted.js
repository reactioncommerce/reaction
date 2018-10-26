import { operators, propertyTypes } from "./helpers";


/**
 * @summary Filter shipping methods based on global restrictions
 * @param {Object} universalShippingRestrictions - provided global restriction settings
 * @param {Object} shippingAttributes - computed shippingAttributes for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default function cartShippingRestricted(shippingAttributes, doc) {
  const { universalShippingRestrictions } = doc;

  const { items } = shippingAttributes;
  const { deny: { attributes } } = universalShippingRestrictions;

  // If there are no global restrictions, then stop global check and move on
  // to method specific checks
  if (!attributes || !Array.isArray(attributes) || !attributes.length) {
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

  // If restrictions are found, true
  // If they aren't found, return false
  return doItemsContainGlobalRestrictions;
}
