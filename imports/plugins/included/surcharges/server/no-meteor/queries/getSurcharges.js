/**
 * @name getSurcharges
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the Surcharges collection for surcharges with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the surcharges
 * @return {Promise<Object>|undefined} - A surcharge document, if one is found
 */
export default async function getSurcharges(context, { shopId } = {}) {
  const { collections } = context;
  const { FlatRateFulfillmentSurcharges } = collections;

  console.log("shopI---------------------", shopId);


  return FlatRateFulfillmentSurcharges.find({
    shopId
  });
}
