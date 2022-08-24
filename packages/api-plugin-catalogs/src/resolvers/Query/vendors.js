import getPaginatedResponseFromAggregate from "@reactioncommerce/api-utils/graphql/getPaginatedResponseFromAggregate.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/vendors
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of all the vendors
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String[]} args.shopIds - Optional IDs of the shop to get a list of vendors for
 * @param {String[]} args.tagIds - Optional IDs of the tags to get a list of vendors for
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>} A CatalogItemConnection object
 */
export default async function vendors(_, args, context, info) {
  const { shopIds: opaqueShopIds, tagIds: opaqueTagIds, ...connectionArgs } = args;

  const shopIds = opaqueShopIds && opaqueShopIds.map(decodeShopOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  const { collection, pipeline } = await context.queries.vendors(context, {
    shopIds,
    tagIds
  });

  return getPaginatedResponseFromAggregate(collection, pipeline, { ...connectionArgs, sortBy: "name" }, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info)
  });
}
