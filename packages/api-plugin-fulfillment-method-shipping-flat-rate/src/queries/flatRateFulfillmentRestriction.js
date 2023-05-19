/**
 * @name flatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment
 * @summary Query the FulfillmentRestrictions collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the restriction
 * @param {String} params.restrictionId - Restriction ID of the restriction
 * @returns {Promise<Object>|undefined} - A restrictions document, if one is found
 */
export default async function flatRateFulfillmentRestriction(context, { restrictionId, shopId } = {}) {
  const { collections: { FulfillmentRestrictions } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentRestrictions", "read", { shopId });

  return FulfillmentRestrictions.findOne({
    _id: restrictionId,
    shopId
  });
}
