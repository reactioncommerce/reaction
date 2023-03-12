/**
 * @name flatRateFulfillmentRestrictions
 * @method
 * @memberof Fulfillment
 * @summary Query the FulfillmentRestrictions collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the restrictions
 * @returns {Promise<Object>|undefined} - A restrictions document, if one is found
 */
export default async function flatRateFulfillmentRestrictions(context, { shopId } = {}) {
  const { collections: { FulfillmentRestrictions } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentRestrictions", "read", { shopId });

  return FulfillmentRestrictions.find({
    shopId
  });
}
