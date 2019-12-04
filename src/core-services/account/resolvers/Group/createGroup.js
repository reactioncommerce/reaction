
/**
 * @name group/createGroup
 * @method
 * @memberof Group/GraphQL
 * @summary A resolver creates a new permission group for a shop
 * It creates permission group for a given shop with passed in roles
 * @param {object} input - The input supplied from GraphQL
 * @param {Object} input.groupData - info about group to create
 * @param {String} input.groupData.name - name of the group to be created
 * @param {String} input.groupData.description - Optional description of the group to be created
 * @param {Array} input.groupData.permissions - permissions to assign to the group being created
 * @param {Array} input.groupData.members - members of the
 * @param {object} context - The GraphQL context
 * @param {String} context.shopId - id of the shop the group belongs to
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function createdBy(_, {input}, context) {
  return context.mutations.createGroup(input, context);
}
