import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

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

  const internalShopId = isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId;

  return context.queries.appSettings(context, internalShopId);
}
