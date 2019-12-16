import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name group/createAccountGroup
 * @method
 * @memberof Group/GraphQL
 * @summary A resolver creates a new permission group for a shop
 * It creates permission group for a given shop with passed in roles
 * @param {object} _ - Not used
 * @param {object} input - The input supplied from GraphQL
 * @param {Object} input.group - info about group to create
 * @param {String} input.group.name - name of the group to be created
 * @param {String} [input.group.description] - Optional description of the group to be created
 * @param {Array} input.group.permissions - permissions to assign to the group being created
 * @param {Array} [input.group.members] - members of the
 * @param {object} context - The GraphQL context
 * @param {String} context.shopId - id of the shop the group belongs to
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function createAccountGroup(_, { input }, context) {
  const { shopId } = input;
  const decodedShopId = decodeShopOpaqueId(shopId);

  const transformedInput = { ...input, shopId: decodedShopId };

  return context.mutations.createAccountGroup(context, transformedInput);
}
