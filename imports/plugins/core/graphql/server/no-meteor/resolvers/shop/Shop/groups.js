import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Shop.groups"
 * @method
 * @memberof Shop/GraphQL
 * @summary find and return the groups for a shop
 * @param {Object} resolverArgs - an object containing the result returned from the resolver
 * @param {String} resolverArgs._id - id of group to query
 * @param {GroupConnectionArgs} args - an object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of user Group objects
 */
export default async function groups({ _id }, connectionArgs, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(_id);
  const query = await context.queries.accounts.groups(context, dbShopId);

  return getPaginatedResponse(query, connectionArgs);
}
