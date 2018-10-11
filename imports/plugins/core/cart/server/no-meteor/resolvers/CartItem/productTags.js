import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";

/**
 * @name "CartItems.productTags"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Returns the tags for a CartItem
 * @param {Object} product - CartItem from parent resolver
 * @param {TagConnectionArgs} args - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tags(cartItem, connectionArgs, context) {
  const { productTagIds } = cartItem;
  if (!productTagIds || productTagIds.length === 0) return xformArrayToConnection(connectionArgs, []);

  const query = await context.queries.tagsByIds(context, productTagIds, connectionArgs);

  return getPaginatedResponse(query, connectionArgs);
}
