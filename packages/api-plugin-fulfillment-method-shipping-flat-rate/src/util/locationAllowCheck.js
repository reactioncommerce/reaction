import isDestinationRestricted from "./isDestinationRestricted.js";

/**
 * @summary Filter shipping methods based on per method allow location restrictions
 * @param {Object} methodRestrictions - method restrictions from FlatRateFulfillmentRestrcitionsCollection
 * @param {Object} method - current method to check restrictions against
 * @param {Object} hydratedOrder - hydrated order for current order
 * @returns {Bool} true / false as to whether method is still valid after this check
 */
export async function locationAllowCheck(methodRestrictions, method, hydratedOrder) {
  const { shippingAddress } = hydratedOrder;
  // Get method specific destination allow restrictions
  const allowRestrictions = methodRestrictions.filter((restriction) => restriction.type === "allow");

  // If there are no location deny restrictions, this method is valid at this point
  if (allowRestrictions.length === 0) return true;

  // Loop over each allow restriction and determine if this method is valid
  // If any levels of destination match, this method is valid at this point
  const isAllowed = allowRestrictions.some((methodRestriction) => {
    const { destination } = methodRestriction;

    return !destination || isDestinationRestricted(destination, shippingAddress);
  });

  return isAllowed;
}
