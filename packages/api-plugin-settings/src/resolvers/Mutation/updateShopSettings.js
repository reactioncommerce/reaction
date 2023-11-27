import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/updateShopSettings
 * @method
 * @memberof Shop/GraphQL
 * @summary resolver for the updateShopSettings GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.shopId - Shop ID
 * @param {Object} args.input.settingsUpdates - Updated fields
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} ShopsPayload
 */
export default async function updateShopSettings(_, { input }, context) {
  const {
    shopId: opaqueShopId,
    settingsUpdates,
    clientMutationId = null
  } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const shopSettings = await context.mutations.updateAppSettings(context, settingsUpdates, shopId);

  return {
    clientMutationId,
    shopSettings
  };
}
