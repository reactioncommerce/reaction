import { Meteor } from "meteor/meteor";
import _ from "lodash";
import { Reaction } from "/client/api";
import * as Collections from "/lib/collections";

/**
 * @method sortUsersIntoGroups
 * @memberof Accounts
 * @summary helper - client puts each full user object into an array on the group they belong
 * @param {Array} accounts - list of user account objects
 * @param {Array} groups - list of permission groups
 * @return {Array} - array of groups, each having a `users` field
 */
export default function sortUsersIntoGroups({ accounts, groups }) {
  const newGroups = groups.map((group) => {
    const matchingAccounts = accounts.filter((acc) => acc.groups && acc.groups.indexOf(group._id) > -1);
    group.users = _.compact(matchingAccounts);
    return group;
  });
  return newGroups;
}

/**
 * @method sortGroups
 * @memberof Accounts
 * @summary Sort to display higher permission groups and "owner" at the top
 * @param  {Array} groups [description]
 * @return {Array}        [description]
 */
export function sortGroups(groups) {
  return groups.sort((prev, next) => {
    if (next.slug === "owner") { return 1; } // owner tops
    return next.permissions.length - prev.permissions.length;
  });
}

/**
 * @method getInvitableGroups
 * @memberof Accounts
 * @summary helper - client This generates a list of groups the user can invite to.
 * It filters out the owner group (because you cannot invite directly to an existing shop as owner)
 * It also filters out groups that the user does not have needed permissions to invite to.
 * All these are also checked by the Meteor method, so this is done to prevent trying to invite and getting error
 * @param {Array} groups - list of user account objects
 * @return {Array} - array of groups or empty object
 */
export function getInvitableGroups(groups) {
  return groups
    .filter((grp) => grp.slug !== "owner")
    .filter((grp) => Reaction.canInviteToGroup({ group: grp }));
}

/**
 * @method getDefaultUserInviteGroup
 * @memberof Accounts
 * @summary user's default invite groups is the group they belong
 * if the user belongs to owner group, it defaults to shop manager (because you cannot invite directly
 * to an existing shop as owner). If no match still, use the first of the groups passed
 * (e.g in case of Marketplace owner accessing a merchant shop)
 * @param  {Array} groups [description]
 * @return {Object}        [description]
 */
export function getDefaultUserInviteGroup(groups) {
  let result;
  const user = Collections.Accounts.findOne({ userId: Meteor.userId() });
  result = groups.find((grp) => user && user.groups.indexOf(grp._id) > -1);

  if (result && result.slug === "owner") {
    result = groups.find((grp) => grp.slug === "shop manager");
  }

  if (!result) {
    result = groups.find((firstGroup) => firstGroup);
  }

  return result;
}

/**
 * @method groupPermissions
 * @memberof Accounts
 * @summary Return all permissions for packages
 * @todo Review hardcoded `reaction` in package names
 * @param  {Array} packages [description]
 * @return {Object}          [description]
 */
export function groupPermissions(packages) {
  return packages.reduce((registeredPackages, pkg) => {
    const permissions = [];
    if (pkg.registry && pkg.enabled) {
      for (const registryItem of pkg.registry) {
        if (!registryItem.route) {
          continue;
        }

        // Get all permissions, add them to an array
        if (registryItem.permissions) {
          for (const permission of registryItem.permissions) {
            // check needed because of non-object perms in the permissions array (e.g "admin", "owner")
            if (typeof permission === "object") {
              permission.shopId = Reaction.getShopId();
              permissions.push(permission);
            }
          }
        }

        // Also create an object map of those same permissions as above
        const permissionMap = getPermissionMap(permissions);
        if (!permissionMap[registryItem.route]) {
          permissions.push({
            shopId: pkg.shopId,
            permission: registryItem.name || `${pkg.name}/${registryItem.template}`,
            icon: registryItem.icon,
            // TODO: Rethink naming convention for permissions list
            label: registryItem.label || registryItem.route
          });
        }
      }
      // TODO review this, hardcoded WIP "reaction"
      const label = pkg.name.replace("reaction", "").replace(/(-.)/g, (x) => ` ${x[1].toUpperCase()}`);

      const newObj = {
        shopId: pkg.shopId,
        icon: pkg.icon,
        name: pkg.name,
        label,
        permissions: _.uniq(permissions)
      };

      registeredPackages.push(newObj);
    }

    return registeredPackages;
  }, []);
}

function getPermissionMap(permissions) {
  const permissionMap = {};
  permissions.forEach(({ label, permission }) => {
    permissionMap[permission] = label;
  });
  return permissionMap;
}
