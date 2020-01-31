import Random from "@reactioncommerce/random";
import { defaultSystemManagerRoles } from "./defaultRoles.js";

/**
 * @name ensureSystemManagerGroup
 * @summary Ensure system manager group exists
 * @param {Object} context App context
 * @returns {String} id of system manager group
 */
export default async function ensureSystemManagerGroup(context) {
  const { collections: { Groups } } = context;
  // get IDs of `system-manager` and `account-manager` groups
  const group = await Groups.findOne({ slug: "system-manager" }, { projection: { _id: 1 } });
  let groupId = (group && group._id) || null;
  // if system-manager group doesn't exist, create it now
  if (!group) {
    groupId = Random.id();
    await Groups.insertOne({
      _id: groupId,
      name: "system manager",
      slug: "system-manager",
      permissions: defaultSystemManagerRoles,
      shopId: null
    });
  }

  return groupId;
}
