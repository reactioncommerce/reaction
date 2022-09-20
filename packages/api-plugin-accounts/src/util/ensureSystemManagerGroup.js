/**
 * @name ensureSystemManagerGroup
 * @summary Ensure system manager group exists
 * @param {Object} context App context
 * @returns {String} id of system manager group
 */
export default async function ensureSystemManagerGroup(context) {
  const { collections: { Groups } } = context;
  const group = await Groups.findOne({ slug: "system-manager" }, { projection: { _id: 1 } });
  let groupId = (group && group._id) || null;

  // if system-manager group doesn't exist, create it now
  if (!group) {
    const { group: newGroup } = await context.mutations.createAccountGroup(context.getInternalContext(), {
      group: {
        name: "system manager",
        slug: "system-manager"
      },
      shopId: null
    });
    groupId = newGroup._id;
  }

  return groupId;
}
