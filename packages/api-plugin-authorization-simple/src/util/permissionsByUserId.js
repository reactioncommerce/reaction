import _ from "lodash";

/**
 * @summary Return all permissions for an account, given a user ID
 * @param {Object} context App context
 * @param {String} userId User ID
 * @return {Promise<Object|null>} Account
 */
export default async function permissionsByUserId(context, userId) {
  const account = await context.collections.Accounts.findOne({ userId });

  if (account && Array.isArray(account.groups)) {
    // get all groups that this user belongs to
    const groups = await context.collections.Groups.find({ _id: { $in: account.groups } }).toArray();

    // global groups are groups without a shopId
    // there may be multiple global groups
    const globalGroupPermissions = groups.filter((group) => !group.shopId).map((group) => group.permissions);
    const flattenedGlobalGroupPermissions = globalGroupPermissions.flat();
    const uniqueGlobalPermissions = _.uniq(flattenedGlobalGroupPermissions);
    // set global roles
    const accountPermissions = { __global_roles__: uniqueGlobalPermissions }; // eslint-disable-line camelcase

    // shopGroups are groups with a shopId
    // there may be multiple groups from one shop
    // get all unique shopIds to map over
    const allShopIds = groups.filter((group) => group.shopId).map((group) => group.shopId);
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
