/**
 * @name fulfillmentTypes
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Fulfillment collection for a list of fulfillment types
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.shopId - The shop id of the fulfillment types
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function fulfillmentTypes(context, input) {
  const { collections: { Fulfillment } } = context;
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

  return Fulfillment.find({
    shopId
  });
}
