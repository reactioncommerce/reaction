import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/emailTemplates
 * @method
 * @memberof Templates/Query
 * @param {Object} _ unused
 * @param {Object} args - an object of all the arguments that were sent by the client
 * @param {String} args.shopId - id of the shop
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info - info about the GraphQL request
 * @returns {Promise<Object>} an array of email templates
 */
export default async function emailTemplates(_, args, context, info) {
  const { shopId: opaqueShopId, ...connectionArgs } = args;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const query = await context.queries.emailTemplates(context, shopId);

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
