/**
 * @summary Determine whether one user is allowed to add another user
 *   to an auth group.
 * @param {Object} context App context
 * @param {Object} group Group document
 * @return {Boolean} True if allowed to add someone to this group
 */
export default async function canAddAccountToGroup(context, group) {
  const {
    isInternalCall,
    userHasPermission
  } = context;

  if (isInternalCall) return true;

  const { shopId } = group;

  // An account can add another account to a group as long as the account adding
  // has `reaction:legacy:groups/manage:accounts` permissions
  const hasPermissionToAddAccountToGroup = await userHasPermission("reaction:legacy:groups", "manage:accounts", { shopId });

  return hasPermissionToAddAccountToGroup;
}
