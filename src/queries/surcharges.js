/**
 * @name surcharges
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the Surcharges collection for surcharges with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the surcharges
 * @returns {Promise<Object>|undefined} - Surcharge documents, if found
 */
export default async function surcharges(context, { shopId } = {}) {
  const { collections } = context;
  const { Surcharges } = collections;

  return Surcharges.find({
    shopId
  });
}
