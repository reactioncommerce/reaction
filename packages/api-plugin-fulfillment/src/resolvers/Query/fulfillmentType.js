/**
 * @name Query/fulfillmentType
 * @method
 * @memberof Fulfillment/Query
 * @summary Query for a single fulfillment type
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.fulfillmentTypeId - Fulfillment type ID to get the record of
 * @param {String} args.shopId - Shop ID to get record for
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Fulfillment type
 */
export default async function fulfillmentType(_, args, context) {
  const { fulfillmentTypeId, shopId } = args;

  return context.queries.fulfillmentType(context, {
    fulfillmentTypeId,
    shopId
  });
}
