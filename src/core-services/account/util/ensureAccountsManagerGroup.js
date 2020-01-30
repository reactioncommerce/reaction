import Random from "@reactioncommerce/random";
import { defaultAccountsManagerRoles } from "./defaultRoles.js";

/**
 * @name ensureAccountsManagerGroup
 * @summary Ensure accounts manager group exists
 * @param {Object} context App context
 * @returns {String} id of accounts manager group
 */
export default async function ensureAccountsManagerGroup(context) {
  const { collections: { Groups } } = context;
  // get IDs of `accounts-manager` and `account-manager` groups
  const group = await Groups.findOne({ slug: "accounts-manager" }, { projection: { _id: 1 } });
  let groupId = (group && group._id) || null;
  // if accounts-manager group doesn't exist, create it now
  if (!group) {
    groupId = Random.id();
    await Groups.insertOne({
      _id: groupId,
      name: "accounts manager",
      slug: "accounts-manager",
      permissions: defaultAccountsManagerRoles,
      shopId: null
    });
  }

  return groupId;
}
