import isDestinationRestricted from "./isDestinationRestricted.js";

/**
 * @summary Filter shipping methods based on per method deny location restrictions
 * @param {Object} methodRestrictions - method restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} method - current method to check restrictions against
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

    return !destination || !isDestinationRestricted(destination, shippingAddress);
  });

  return isAllowed;
}
