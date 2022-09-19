import { decodeFulfillmentGroupOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/getFulfillmentType
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
export default async function getFulfillmentType(_, args, context) {
  const {
    fulfillmentTypeId: opaqueTypeId,
    shopId: opaqueShopId
  } = args;

  const fulfillmentTypeId = decodeFulfillmentGroupOpaqueId(opaqueTypeId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  return context.queries.getFulfillmentType(context, {
    fulfillmentTypeId,
    shopId
  });
}
