import flatRateFulfillmentRestriction from "./flatRateFulfillmentRestriction.js";

/**
 * @name getFlatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment
 * @summary Query the FulfillmentRestrictions collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.restrictionId - ID of the restriction
 * @param {String} params.shopId - Shop ID for the shop that owns the restriction
 * @returns {Promise<Object>|undefined} - A restrictions document, if one is found
 * @deprecated since version 5.0, use flatRateFulfillmentRestriction instead
 */
export default async function getFlatRateFulfillmentRestriction(context, { restrictionId, shopId } = {}) {
  return flatRateFulfillmentRestriction(context, { restrictionId, shopId });
}
