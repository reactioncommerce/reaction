import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.systemInfo
 * @method
 * @memberof /GraphQL
 * @summary get system infomation for reaction site
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - shop id for which to get tax services
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Array of tax services
 */
export default async function systemInformation(_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  return context.queries.systemInformation(context, dbShopId);
}
