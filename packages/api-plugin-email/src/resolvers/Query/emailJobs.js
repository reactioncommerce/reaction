import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query.emailJobs
 * @method
 * @memberof Routes/GraphQL
 * @summary Returns a paginated list of `sendEmail` jobs
 * @param {Object} parentResult unused
 * @param {Object} args Arguments from the client
 * @param {String} args.shopIds IDs of the shops to get emails for
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Email jobs connection
 */
export default async function emailJobs(parentResult, args, context, info) {
  const {
    shopIds: opaqueShopIds,
    ...connectionArgs
  } = args;

  const shopIds = opaqueShopIds.map((opaqueShopId) => (isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId));

  const cursor = await context.queries.emailJobs(context, shopIds);

  return getPaginatedResponse(cursor, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
