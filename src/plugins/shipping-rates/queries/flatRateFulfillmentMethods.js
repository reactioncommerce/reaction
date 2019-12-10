/**
 * @name flatRateFulfillmentMethods
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Shipping collection for a list of fulfillment methods
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.shopId - The shop id of the fulfillment methods
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function flatRateFulfillmentMethods(context, input) {
  const { collections } = context;
  const { Shipping } = collections;
  const { shopId } = input;

  await context.validatePermissions("reaction:shippingMethods", "read", { shopId, legacyRoles: ["owner", "admin", "shipping"] });

  return Shipping.find({
    shopId
  });
}
