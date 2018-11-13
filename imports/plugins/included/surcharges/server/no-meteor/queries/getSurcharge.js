/**
 * @name getSurcharge
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the Surcharges collection for restrictions with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the restriction
 * @return {Promise<Object>|undefined} - A surcharge document, if one is found
 */
export default async function getSurcharge(context, { surchargeId, shopId } = {}) {
  const { collections } = context;
  const { FlatRateFulfillmentSurcharges } = collections;

  return FlatRateFulfillmentSurcharges.find({
    _id: surchargeId,
    shopId
  });
}
