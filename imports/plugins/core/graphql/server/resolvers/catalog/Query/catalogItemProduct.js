import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name catalogItemProduct
 * @method
 * @summary Get a list of catalogItemProduct
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.shopIds - limit to catalog items for these shops
 * @param {Object} args.tagIds - limit to catalog items with these tags
 * @param {Boolean} args.shouldIncludeDeleted - Whether or not to include `isDeleted=true` tags. Default is `false`
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function catalogItemProduct(_, args, context) {
  const { slugOrId: opaqueSlugOrId } = args;

  const slugOrId = opaqueSlugOrId;

  const query = await context.queries.catalogItemProduct(context, {
    slugOrId
  });

  return query;
}
