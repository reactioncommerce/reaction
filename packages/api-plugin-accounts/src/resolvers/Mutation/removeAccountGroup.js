import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeGroupOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name group/removeAccountGroup
 * @method
 * @memberof Group/GraphQL
 * @summary A resolver that removes an existing permission group for a shop
 * @param {object} _ - Not used
 * @param {object} input - The input supplied from GraphQL
 * @param {String} input.groupId - id of the group to remove
 * @param {String} input.shopId - id of the shop the group belongs to
 * @param {object} context - The GraphQL context
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function removeAccountGroup(_, { input }, context) {
  const { groupId, shopId, clientMutationId } = input;

  const decodedGroupId = isOpaqueId(groupId) ? decodeGroupOpaqueId(groupId) : groupId;
  const decodedShopId = isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId;

  const group = context.mutations.removeAccountGroup(context, {
    groupId: decodedGroupId,
    shopId: decodedShopId
  });

  return {
    clientMutationId,
    group
  };
}
