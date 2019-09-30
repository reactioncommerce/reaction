/**
 * @name surchargeById
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the Surcharges collection for a surcharge with the provided shopId and surchargeId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.language - Language to retrieve surcharge message in
 * @param {String} params.shopId - Shop ID for the shop that owns the surcharge
 * @param {String} params.surchargeId - Surcharge ID of the surcharge we are requesting
 * @returns {Promise<Object>|undefined} - A surcharge document, if one is found
 */
export default async function surchargeById(context, { surchargeId, shopId } = {}) {
  const { collections } = context;
  const { Surcharges } = collections;

  const surcharge = await Surcharges.findOne({
    _id: surchargeId,
    shopId
  });

  return surcharge;
}
