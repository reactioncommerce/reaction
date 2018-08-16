import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";

/**
 * @name "CatalogProduct.tags"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Returns the tags for a product
 * @param {Object} product - CatalogProduct response from parent resolver
 * @param {TagConnectionArgs} args - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tags(product, connectionArgs, context) {
  const { tagIds } = product;
  if (!tagIds || tagIds.length === 0) return xformArrayToConnection(connectionArgs, []);

  const query = await context.queries.catalog.tagsByIds(context, tagIds, connectionArgs);

  return getPaginatedResponse(query, connectionArgs);
}
