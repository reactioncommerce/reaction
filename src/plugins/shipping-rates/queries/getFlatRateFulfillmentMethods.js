/**
 * @name getFlatRateFulfillmentMethods
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Shipping collection for a list of fulfillment methods
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.shopId - The shop id of the fulfillment methods
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function getFlatRateFulfillmentMethods(context, input) {
  const { checkPermissions, collections } = context;
  const { Shipping } = collections;
  const { shopId } = input;

  await checkPermissions(["owner", "admin"], shopId);

  return Shipping.find({
    shopId
  });
}
