import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query.addressValidationRules
 * @method
 * @memberof Routes/GraphQL
 * @summary Returns a paginated list of address validation rules
 * @param {Object} parentResult unused
 * @param {Object} args Arguments from the client
 * @param {String} args.shopId ID of shop to get rules for
 * @param {String[]} [args.serviceNames] Optionally return rules only for these services
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} Address validation rules connection
 */
export default async function addressValidationRules(parentResult, args, context, info) {
  const {
    serviceNames,
    shopId: opaqueShopId,
    ...connectionArgs
  } = args;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const cursor = await context.queries.addressValidationRules(context, {
    serviceNames,
    shopId
  });

  return getPaginatedResponse(cursor, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
