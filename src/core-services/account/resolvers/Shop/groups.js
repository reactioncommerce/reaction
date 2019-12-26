import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

/**
 * @name Shop/groups
 * @method
 * @memberof Shop/GraphQL
 * @summary find and return the groups for a shop
 * @param {Object} shop Shop returned by the parent resolver
 * @param {GroupConnectionArgs} connectionArgs - an object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object[]>} Promise that resolves with array of user Group objects
 */
export default async function groups(shop, connectionArgs, context, info) {
  const query = await context.queries.groups(context, shop._id);
  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
