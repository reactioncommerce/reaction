import getPaginatedResponseFromAggregate from "@reactioncommerce/api-utils/graphql/getPaginatedResponseFromAggregate.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";

/**
 * @name Query/invitations
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Accounts collection and return a list of invitations
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} [args.shopIds] - Array of shop IDs
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Promise containing queried invitations
 */
export default async function invitations(_, args, context, info) {
  const { collection, pipeline } = await context.queries.invitationsAggregate(context, args);

  return getPaginatedResponseFromAggregate(collection, pipeline, args, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
