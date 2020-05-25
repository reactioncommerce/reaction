/**
 * @name flatRateFulfillmentMethod
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Shipping collection for a single fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.methodId - The fulfillment method id
 * @param {String} input.shopId - The shop id of the fulfillment method
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function flatRateFulfillmentMethod(context, input) {
  const { collections } = context;
  const { Shipping } = collections;
  const { methodId, shopId } = input;

  await context.validatePermissions("reaction:legacy:shippingMethods", "read", {
    shopId
  });

  const doc = await Shipping.findOne({
    "methods._id": methodId,
    shopId
  });
  if (!doc) return null;

  // eslint-disable-next-line no-shadow
  const method = doc.methods.find((method) => method._id === methodId);
  return {
    ...method,
    shopId
  };
}
