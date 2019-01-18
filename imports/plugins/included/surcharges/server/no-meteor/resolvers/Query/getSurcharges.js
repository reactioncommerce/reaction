import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name "Query.getSurcharges"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the getSurcharges GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns these surcharges
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Surcharge object
 */
export default async function getSurcharges(parentResult, args, context) {
  const { language, shopId, ...connectionArgs } = args;

  const cursor = await context.queries.getSurcharges(context, {
    language,
    shopId: decodeShopOpaqueId(shopId)
  });

  const response = await getPaginatedResponse(cursor, connectionArgs);

  if (response) {
    // Add language from args so that we can use it to get translated message
    response.nodes.forEach((node) => {
      node.language = language;
    });
  }

  return response;
}
