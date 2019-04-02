/**
 * @summary Filter shipping methods based on per method deny location restrictions
 * @param {Object} methodRestrictions - method restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} method - current method to check restrcictions against
 * @param {Object} hydratedOrder - hydrated order for current order
 * @returns {Bool} true / false as to whether method is still valid after this check
 */
export async function locationDenyCheck(methodRestrictions, method, hydratedOrder) {
  const { shippingAddress } = hydratedOrder;
  // Get method specific allow restrictions
  const denyRestrictions = methodRestrictions.filter((restriction) => restriction.type === "deny");

  // If there are no destination deny restrictions, this method is valid at this point
  if (denyRestrictions.length === 0) return true;

  // Loop over each deny restriction and determine if this method is valid
  // If any levels of destination match, this method is invalid at this point
  const isAllowed = denyRestrictions.every((methodRestriction) => {
    const { destination } = methodRestriction;

    // If there is no destination restriction on this method, it is valid at this point
    if (!destination) {
      return true;
    }

    // Start checking at the macro-level, and move more macro as we go on
    // Check for an allow list of countries
    if (destination.country && destination.country.includes(shippingAddress.country)) {
      return false;
    }

    // Check for an allow list of regions
    if (destination.region && destination.region.includes(shippingAddress.region)) {
      return false;
    }

    // Check for an allow list of postal codes
    if (destination.postal && destination.postal.includes(shippingAddress.postal)) {
      return false;
    }

    return true;
  });

  return isAllowed;
}
