/**
 * @summary Returns true if the given shipping address is restricted by destination rules
 * @param {Object} destination Destination restrictions
 * @param {Object} [shippingAddress] Shipping address, if known
 * @return {Boolean} True if restricted
 */
export default function isDestinationRestricted(destination, shippingAddress) {
  // If there is no shipping address, we can't restrict by destination
  if (!shippingAddress) return false;

  const { country: restrictionCountry, postal: restrictionPostal, region: restrictionRegion } = destination;

  // Start checking at the micro-level, and move more macro as we go on
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

  /**
   * This adds support for address regex match on address1 and address2
   * It is required to implement basic match against PO Box addresses
   */
  if (destination.addressPattern) {
    const { addressPatternShouldMatch = true } = destination;
    const fullAddress = [shippingAddress.address1, shippingAddress.address2].join(" ");
    const addressMatchesPattern = RegExp(destination.addressPattern, "ig").test(fullAddress);
    if ((addressMatchesPattern && addressPatternShouldMatch) || (!addressMatchesPattern && !addressPatternShouldMatch)) {
      return true;
    }
  }

  return false;
}
