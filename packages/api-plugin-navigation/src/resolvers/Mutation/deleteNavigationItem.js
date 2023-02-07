import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeNavigationItemOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.deleteNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for deleteNavigation GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.id ID of the navigation item to delete
 * @param {String} args.input.shopId ID of the shop navigation item belongs
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} DeleteNavigationItemPayload
 */
export default async function deleteNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    id: opaqueNavigationItemId,
    shopId: opaqueShopId
  } = input;

  const navigationItemId = isOpaqueId(opaqueNavigationItemId) ? decodeNavigationItemOpaqueId(opaqueNavigationItemId) : opaqueNavigationItemId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const deletedNavigationItem = await context.mutations.deleteNavigationItem(context, {
    navigationItemId,
    shopId
  });

  return {
    clientMutationId,
    navigationItem: deletedNavigationItem
  };
}
