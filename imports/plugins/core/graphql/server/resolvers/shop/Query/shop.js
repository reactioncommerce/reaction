import { pipe } from "ramda";
import { decodeShopOpaqueId, xformShopResponse } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name shop
 * @method
 * @summary query the Shops collection and return shop data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - ID of shop to query
 * @param {Object} context - an object containing the per-request state
 * @return {Object} user account object
 */
export default function shop(_, { id }, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(id);

  return pipe(
    context.queries.shopById,
    xformShopResponse
  )(context, dbShopId);
}
