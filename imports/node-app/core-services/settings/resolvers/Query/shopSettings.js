import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query/shopSettings
 * @method
 * @memberof Core/GraphQL
 * @summary Gets global settings
 * @param {Object} _ - unused
 * @param {Object} args - Args passed by the client
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} The global settings object
 */
export default async function shopSettings(_, args, context) {
  const { shopId } = args;

  const internalShopId = decodeShopOpaqueId(shopId);

  return context.queries.appSettings(context, internalShopId);
}
