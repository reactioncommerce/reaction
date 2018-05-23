import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name "Query.tag"
 * @method
 * @memberof Tag/GraphQL
 * @summary Returns the tags for a shop
 * @param {Object} _ - unused
 * @param {Object} args - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tag(_, { tagId }, context) {
  const dbTagId = decodeTagOpaqueId(tagId);
  return context.queries.tag(context, dbTagId);
}
