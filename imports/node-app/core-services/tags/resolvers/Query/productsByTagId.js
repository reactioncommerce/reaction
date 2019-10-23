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
 * @returns {Promise<Array<Object>>} TagProducts Connection
 */
export default async function productsByTagId(_, params, context) {
  const {
    after,
    before,
    first,
    last,
    shopId: opaqueShopId,
    sortOrder,
    tagId: opaqueTagId
  } = params;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const tagId = decodeTagOpaqueId(opaqueTagId);

  return context.queries.productsByTagId(context, {
    connectionArgs: {
      after,
      before,
      first,
      last,
      sortOrder
    },
    shopId,
    tagId
  });
}
