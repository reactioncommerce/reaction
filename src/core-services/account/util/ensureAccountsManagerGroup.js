/**
 * @name ensureAccountsManagerGroup
 * @summary Ensure accounts manager group exists
 * @param {Object} context App context
 * @returns {String} id of accounts manager group
 */
export default async function ensureAccountsManagerGroup(context) {
  const { collections: { Groups } } = context;
  const group = await Groups.findOne({ slug: "accounts-manager" }, { projection: { _id: 1 } });
  let groupId = (group && group._id) || null;

  // if accounts-manager group doesn't exist, create it now
  if (!group) {
    const { group: newGroup } = await context.mutations.createAccountGroup(context.getInternalContext(), {
      group: {
        name: "accounts manager",
        slug: "accounts-manager"
      },
      shopId: null
    });
    groupId = newGroup._id;
  }

  return groupId;
}
