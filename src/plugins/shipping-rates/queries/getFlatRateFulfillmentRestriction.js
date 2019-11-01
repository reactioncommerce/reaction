/**
 * @name getFlatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the FlatRateFulfillmentRestrictions collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the restriction
 * @returns {Promise<Object>|undefined} - A restrictions document, if one is found
 */
export default async function getFlatRateFulfillmentRestriction(context, { restrictionId, shopId } = {}) {
  const { validatePermissions, validatePermissionsLegacy, collections } = context;
  const { FlatRateFulfillmentRestrictions } = collections;

  await validatePermissionsLegacy(["admin", "owner", "shipping"], shopId);
  await validatePermissions(`reaction:shippingRestrictions:${restrictionId}`, "read", { shopId });

  return FlatRateFulfillmentRestrictions.findOne({
    _id: restrictionId,
    shopId
  });
}
