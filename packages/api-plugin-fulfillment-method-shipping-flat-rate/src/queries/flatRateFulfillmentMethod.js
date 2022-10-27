/**
 * @name flatRateFulfillmentMethod
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Fulfillment collection for a single fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.methodId - The fulfillment method id
 * @param {String} input.shopId - The shop id of the fulfillment method
 * @returns {Promise<Object>} Object
 */
export default async function flatRateFulfillmentMethod(context, input) {
  const { collections: { Fulfillment } } = context;
  const { methodId, shopId } = input;

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "read", { shopId });

  const doc = await Fulfillment.findOne({
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
