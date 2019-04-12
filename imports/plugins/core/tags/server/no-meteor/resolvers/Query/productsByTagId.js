import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import { getOffsetBasedPaginatedResponseFromAggregation } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Query.productsByTagId
 * @method
 * @memberof Tags/GraphQL
 * @summary get a list of products by tag id
 * @param {Object} _ - unused
 * @param {Object} [args] - an object of all arguments that were sent by the client
 * @param {String} [args.shopId] - Shop id
 * @param {String} [args.tagId] - Tag id
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Array<Object>>} TagProducts Connection
 */
export default async function productsByTagId(_, args, context) {
  const shopId = decodeShopOpaqueId(args.shopId);
  const tagId = decodeTagOpaqueId(args.tagId);

  const aggregationOptions = await context.queries.productsByTagId(context, {
    shopId,
    tagId
  });

  return getOffsetBasedPaginatedResponseFromAggregation(aggregationOptions, args);
}
