/* global Gravatar */
import _ from "lodash";
import { Reaction } from "/client/api";
import * as Collections from "/lib/collections";

/**
 * sortUsersIntoGroups - helper - client
 * @summary puts each full user object into an array on the group they belong
 * @param {Array} accounts - list of user account objects
 * @param {Array} groups - list of permission groups
 * @return {Array} - array of groups, each having a `users` field
 */
export default function sortUsersIntoGroups({ accounts, groups }) {
  // sort to display higher permission groups at the top
  const sortedGroups = groups.sort((prev, next) => next.permissions.length - prev.permissions.length);
  const newGroups = sortedGroups.map((group) => {
    const matchingAccounts = accounts.map((acc) => {
      if (acc.groups && acc.groups.indexOf(group._id) > -1) {
        return acc;
      }
    });
    group.users = _.compact(matchingAccounts);
    return group;
  });
  return newGroups;
}

export function getGravatar(user) {
  const options = {
    secure: true,
    size: 30,
    default: "identicon"
  };
  if (!user) { return false; }
  const account = Collections.Accounts.findOne(user._id);
  if (account && account.profile && account.profile.picture) {
    return account.profile.picture;
  }
  if (user.emails && user.emails.length > 0) {
    const email = user.emails[0].address;
    return Gravatar.imageUrl(email, options);
  }
}

export function groupPermissions(packages) {
  return packages.map((pkg) => {
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
            permission: registryItem.name || pkg.name + "/" + registryItem.template,
            icon: registryItem.icon,
            label: registryItem.label || registryItem.provides || registryItem.route
          });
        }
      }
      // TODO review this, hardcoded WIP "reaction"
      const label = pkg.name.replace("reaction", "").replace(/(-.)/g, (x) => " " + x[1].toUpperCase());

      return {
        shopId: pkg.shopId,
        icon: pkg.icon,
        name: pkg.name,
        label: label,
        permissions: _.uniq(permissions)
      };
    }
  });
}

function getPermissionMap(permissions) {
  const permissionMap = {};
  permissions.forEach((existing) => (permissionMap[existing.permission] = existing.label));
  return permissionMap;
}
