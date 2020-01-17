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
    userHasPermission
  } = context;

  if (isInternalCall) return true;

  const { shopId } = group;

  // An account can add another account to a group as long as the person adding
  // has all permissions granted by that group.
  // We can't use `userHasPermission` here because we want to make sure they
  // have ALL the permissions rather than ANY.
  // Accounts in the "owner" group and users with the global "owner" permission
  // are able to add any user to any group, regardless of other permissions.
  const ownerGroup = await Groups.findOne({ name: "owner", shopId });
  const isOwnerAccount = (
    !!ownerGroup && contextUserAccount && contextUserAccount.groups.includes(ownerGroup._id)) ||
    userHasPermission("reaction:legacy:shops", "owner", { shopId }); // TODO(pod-auth): update this to figure out what to do with "owner"

  const hasPermissionToAddAccountToGroup = await isOwnerAccount || await userHasPermission("reaction:legacy:groups", "manage:accounts", { shopId });

  return hasPermissionToAddAccountToGroup;
}
