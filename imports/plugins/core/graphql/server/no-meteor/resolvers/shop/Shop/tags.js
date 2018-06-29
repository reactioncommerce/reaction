import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Shop.tags"
 * @method
 * @memberof Shop/GraphQL
 * @summary Returns the tags for the parent resolver shop
 * @param {Object} _ - unused
 * @param {TagConnectionArgs} args - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tags({ _id }, connectionArgs, context) {
  const dbShopId = decodeShopOpaqueId(_id);

  const query = await context.queries.catalog.tags(context, dbShopId, connectionArgs);

  return getPaginatedResponse(query, connectionArgs);
}
