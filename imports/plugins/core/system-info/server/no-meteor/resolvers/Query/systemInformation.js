import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get system information for reaction site
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args An object of all arguments that were sent by the client
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} System Information Object
 */
export default async function systemInformation(_, args, context) {
  const dbShopId = decodeShopOpaqueId(args.shopId);
  return context.queries.systemInformation(context, dbShopId);
}
