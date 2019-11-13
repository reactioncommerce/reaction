import _ from "lodash";

/**
 * @summary Determine whether one user is allowed to add another user
 *   to an auth group.
 * @param {Object} context App context
 * @param {Object} group Group document
 * @return {Boolean} True if allowed to add someone to this group
 */
export default async function canAddAccountToGroup(context, group) {
  const {
    account: contextUserAccount,
    collections: { Groups },
    isInternalCall,
    user,
    userHasPermission
  } = context;

  if (isInternalCall) return true;

  const { permissions: groupPermissions = [], shopId } = group;

  // An account can add another account to a group as long as the person adding
  // has all permissions granted by that group.
  // We can't use `userHasPermission` here because we want to make sure they
  // have ALL the permissions rather than ANY.
  // Accounts in the "owner" group and users with the global "owner" permission
  // are able to add any user to any group, regardless of other permissions.
  const ownerGroup = await Groups.findOne({ name: "owner", shopId });
  const isOwnerAccount = (!!ownerGroup && contextUserAccount && contextUserAccount.groups.includes(ownerGroup._id)) || userHasPermission(["owner"]);

  return isOwnerAccount || _.difference(groupPermissions, user.roles[shopId] || []).length === 0;
}
