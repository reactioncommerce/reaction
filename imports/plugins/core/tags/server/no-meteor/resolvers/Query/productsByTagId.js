import { getPaginatedAggregateResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name Query.productsByTagId
 * @method
 * @memberof Tags/GraphQL
 * @summary get a list of products by tag id
 * @param {Object} _ - unused
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.shopId] - Shop id
 * @param {String} [params.tagId] - Tag id
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Array<Object>>} TagProducts Connection
 */
export default async function productsByTagId(_, params, context) {
  const shopId = decodeShopOpaqueId(params.shopId);
  const tagId = decodeTagOpaqueId(params.tagId);

  const query = await context.queries.productsByTagId(context, {
    shopId,
    tagId
  });

  const connectionArgs = {
    after: params.after,
    before: params.before,
    first: params.first,
    last: params.last
  };

  return getPaginatedAggregateResponse(query, connectionArgs);
}
