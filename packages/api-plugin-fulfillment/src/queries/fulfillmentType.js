/**
 * @name fulfillmentType
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Fulfillment collection for a single fulfillment type
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.fulfillmentTypeId - The fulfillment type id
 * @param {String} input.shopId - The shop id of the fulfillment type
 * @returns {Promise<Object>} Object
 */
export default async function fulfillmentType(context, input) {
  const { collections: { Fulfillment } } = context;
  const { fulfillmentTypeId, shopId } = input;

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

  const doc = await Fulfillment.findOne({
    _id: fulfillmentTypeId,
    shopId
  });
  if (!doc) return null;

  return {
    ...doc,
    shopId
  };
}
