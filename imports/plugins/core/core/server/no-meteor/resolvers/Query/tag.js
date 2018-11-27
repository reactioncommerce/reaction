import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name "Query.tag"
 * @method
 * @memberof Tag/GraphQL
 * @summary Returns a tag for a shop, based on tag slug or ID
 * @param {Object} _ - unused
 * @param {Object} args - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tag(_, { slugOrId }, context) {
  let dbTagId;

  try {
    dbTagId = decodeTagOpaqueId(slugOrId);
  } catch (e) {
    dbTagId = slugOrId;
  }

  return context.queries.tag(context, dbTagId);
}
