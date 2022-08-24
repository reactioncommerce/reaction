import { decodeGroupOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name group/updateAccountGroup
 * @method
 * @memberof Group/GraphQL
 * @summary A resolver that updates an existing permission group for a shop
 * @param {object} _ - Not used
 * @param {object} input - The input supplied from GraphQL
 * @param {Object} input.group - info about group to update
 * @param {String} input.group.name - name of the group to be updated
 * @param {String} [input.group.description] - Optional description of the group to be updated
 * @param {Array} input.group.permissions - permissions to assign to the group being updated
 * @param {Array} [input.group.members] - members of the group
 * @param {object} context - The GraphQL context
 * @param {String} context.shopId - id of the shop the group belongs to
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function updateAccountGroup(_, { input }, context) {
  const { groupId, shopId, clientMutationId } = input;

  const decodedGroupId = decodeGroupOpaqueId(groupId);
  const decodedShopId = decodeShopOpaqueId(shopId);

  const group = context.mutations.updateAccountGroup(context, {
    ...input,
    groupId: decodedGroupId,
    shopId: decodedShopId
  });

  return {
    clientMutationId,
    group
  };
}
