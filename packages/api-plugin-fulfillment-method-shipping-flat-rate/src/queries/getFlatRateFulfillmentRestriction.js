/**
 * @name getFlatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the FulfillmentRestrictions collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the restriction
 * @returns {Promise<Object>|undefined} - A restrictions document, if one is found
 */
export default async function getFlatRateFulfillmentRestriction(context, { restrictionId, shopId } = {}) {
  const { collections } = context;
  const { FulfillmentRestrictions } = collections;

  // await context.validatePermissions(`reaction:legacy:shippingRestrictions:${restrictionId}`, "read", { shopId });
  await context.validatePermissions(`reaction:legacy:fulfillmentRestrictions:${restrictionId}`, "read", { shopId });

  return FulfillmentRestrictions.findOne({
    _id: restrictionId,
    shopId
  });
}
