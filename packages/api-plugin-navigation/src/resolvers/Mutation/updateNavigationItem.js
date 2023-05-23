import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeNavigationItemOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for updateNavigationItem GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.id ID of the navigation item to update
 * @param {String} args.input.navigationItem The updated navigation item
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} UpdateNavigationItemPayload
 */
export default async function updateNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    id: opaqueNavigationItemId,
    shopId: opaqueShopId,
    navigationItem
  } = input;

  const navigationItemId = isOpaqueId(opaqueNavigationItemId) ? decodeNavigationItemOpaqueId(opaqueNavigationItemId) : opaqueNavigationItemId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const updatedNavigationItem = await context.mutations.updateNavigationItem(context, {
    navigationItemId,
    navigationItem: {
      ...navigationItem,
      shopId: isOpaqueId(navigationItem.shopId) ? decodeShopOpaqueId(navigationItem.shopId) : navigationItem.shopId
    },
    shopId
  });

  return {
    clientMutationId,
    navigationItem: updatedNavigationItem
  };
}
