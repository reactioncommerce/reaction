import GroupData from "../json-data/Groups.json";

const now = new Date();

/**
 * @summary load Groups data
 * @param {Object} context - The application context
 * @returns {Promise<boolean>} true if success
 */
export default async function loadGroups(context) {
  const { collections: { Groups } } = context;
  GroupData.forEach((group) => {
    group.createdAt = now;
    group.updatedAt = now;
  });
  Groups.insertMany(GroupData);
  return true;
}
