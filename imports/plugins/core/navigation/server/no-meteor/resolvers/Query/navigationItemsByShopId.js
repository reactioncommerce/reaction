import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Query.navigationItemsByShopId"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a paginated list of navigation items for a shop, as an operator
 * @param {Object} _ unused
 * @param {ConnectionArgs} args An object of all arguments that were sent by the client
 * @param {String} args.shopId The ID of the shop to load navigation items for
 * @param {Object} context An object containing the per-request state
 * @return {Promise<Object>} A NavigationItemConnection object
 */
export default async function navigationItemsByShopId(_, args, context) {
  const { shopId, ...connectionArgs } = args;
  const { userHasPermission } = context;

  const decodedShopId = decodeShopOpaqueId(shopId);

  const query = await context.queries.navigationItemsByShopId(context, decodedShopId);

  return getPaginatedResponse(query, connectionArgs);
}
