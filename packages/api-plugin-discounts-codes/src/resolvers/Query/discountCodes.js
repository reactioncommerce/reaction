import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/discountCodes
 * @method
 * @memberof DiscountCodes/Query
 * @summary query the Discount codes collection and return user account data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - id of the shop
 * @param {Object} args.filters - query filters
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} An array of discount codes
 */
export default async function discountCodes(_, args, context, info) {
  const { shopId: opaqueShopId, filters, ...connectionArgs } = args;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const query = await context.queries.discountCodes(context, shopId, filters);

  return getPaginatedResponse(query, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
