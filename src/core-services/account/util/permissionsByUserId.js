import _ from "lodash";

/**
 * @summary Return all permissions for an account, given a user ID
 * @param {Object} context App context
 * @param {String} userId User ID
 * @return {Promise<Object|null>} Account
 */
export default async function permissionsByUserId(context, userId) {
  const account = await context.collections.Accounts.findOne({ userId });
  const user = await context.collections.users.findOne({ _id: userId });

  if (account && Array.isArray(account.groups)) {
    // set __global_roles__ from the user
    const accountPermissions = { __global_permissions__: (user && user.roles && user.roles.__global_roles__) || [] }; // eslint-disable-line camelcase

    // get all groups that this user belongs to
    const groups = await context.collections.Groups.find({ _id: { $in: account.groups } }).toArray();
    // get unique shops from groups (there may be multiple groups from one shop)
    const allShopIds = groups.map((group) => group.shopId);
    const uniqueShopIds = _.uniq(allShopIds);

    // get all groups for shop
    // flatten all group arrays into a single array
    // remove duplicate permissions
    // set permissions array with shopId as key on accountPermissions object
    uniqueShopIds.forEach((shopId) => {
      const groupPermissionsForShop = groups.filter((group) => group.shopId === shopId).map((group) => group.permissions);
      const flattenedGroupPermissionsForShop = groupPermissionsForShop.flat();
      const uniquePermissionsForShop = _.uniq(flattenedGroupPermissionsForShop);
      accountPermissions[shopId] = uniquePermissionsForShop;
    });

    return accountPermissions;
  }

  return [];
}
