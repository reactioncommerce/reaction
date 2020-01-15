import _ from "lodash";

/**
 * @summary Return all permissions / roles for an account, given a user ID
 * @param {Object} context App context
 * @param {String} userId User ID
 * @return {Promise<Object|null>} Account
 */
export default async function permissionsByUserId(context, userId) {
  const account = await context.collections.Accounts.findOne({ userId });

  if (account && Array.isArray(account.groups)) {
    // get groups that this user belongs to
    // filter results to only provide permissions arrays
    // flatten multiple permissions arrays into a single array
    // uniqify the permissions
    const groups = await context.collections.Groups.find({ _id: { $in: account.groups } }).toArray();
    const groupPermissions = groups.map((group) => group.permissions);
    const flattenedGroupPermissions = groupPermissions.flat();
    const uniquePermissions = _.uniq(flattenedGroupPermissions);
    return uniquePermissions;
  }

  return [];
}
