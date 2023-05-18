import flatRateFulfillmentRestrictions from "./flatRateFulfillmentRestrictions.js";

/**
 * @name getFlatRateFulfillmentRestrictions
 * @method
 * @memberof Fulfillment
 * @summary Query the FulfillmentRestrictions collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the restrictions
 * @returns {Promise<Object>|undefined} - A restrictions document, if one is found
 * @deprecated since version 5.0, use flatRateFulfillmentRestrictions instead
 */
export default async function getFlatRateFulfillmentRestrictions(context, { shopId } = {}) {
  return flatRateFulfillmentRestrictions(context, { shopId });
}
