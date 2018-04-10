import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name shop
 * @method
 * @summary query the Shops collection and return shop data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - ID of shop to query
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} user account object
 */
export default async function shop(_, { id }, context) {
  const dbShopId = decodeShopOpaqueId(id);

  return context.queries.shopById(context, dbShopId);
}
