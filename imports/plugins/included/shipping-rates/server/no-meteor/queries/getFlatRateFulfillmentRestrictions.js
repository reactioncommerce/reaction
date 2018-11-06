/**
 * @name orderById
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order with the provided orderId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderId - Order ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @return {Promise<Object>|undefined} - An Order document, if one is found
 */
export default async function getFlatRateFulfillmentRestrictions(context, { shopId } = {}) {
  const { collections } = context;
  const { FlatRateFulfillmentRestrictions } = collections;

  return FlatRateFulfillmentRestrictions.find({
    shopId
  });
}
