import _ from "lodash";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "/server/api";

/**
 * @name getRouteName
 * @method
 * @memberof Core
 * @private
 * @summary assemble route name to be standard
 * this is duplicate that exists in Reaction.Router
 * however this is to avoid a dependency in core
 * on the router
 * prefix/package name + registry name or route
 * @param  {string} packageName  [package name]
 * @param  {object} registryItem [registry object]
 * @return {String}              [route name]
 */
function getRouteName(packageName, registryItem) {
  let routeName;
  if (packageName && registryItem) {
    if (registryItem.name) {
      routeName = registryItem.name;
    } else if (registryItem.template) {
      routeName = `${packageName}/${registryItem.template}`;
    } else {
      routeName = `${packageName}`;
    }
    // dont include params in the name
    [routeName] = routeName.split(":");
    return routeName;
  }
  return null;
}


/**
 * @name assignOwnerRoles
 * @method
 * @memberof Core
 * @summary populate roles with all the packages and their permissions
 * this is the main way that roles are inserted and created for
 * admin user.
 * we assign all package roles to each owner account for each shopId
 * we assign only basic GLOBAL_GROUP rights
 *
 * @param  {String} shopId - shopId
 * @param  {String} pkgName - Package name
 * @param  {String} registry - registry object
 * @return {undefined}
 */
export function assignOwnerRoles(shopId, pkgName, registry) {
  const defaultRoles = ["owner", "admin", "createProduct", "guest", pkgName];
  const globalRoles = defaultRoles;

  if (registry) {
    // for each registry item define and push roles
    for (const registryItem of registry) {
      // packages don't need to define specific permission routes.,
      // the routeName will be used as default roleName for each route.
      // todo: check dependency on this.
      const roleName = getRouteName(pkgName, registryItem);
      if (roleName) {
        defaultRoles.push(roleName);
      }

      // Get all defined permissions, add them to an array
      // define permissions if you need to check custom permission
      if (registryItem.permissions) {
        for (const permission of registryItem.permissions) {
          // A wrong value in permissions (ie. [String] instead of [Object] in any plugin register.js
          // results in an undefined element in defaultRoles Array
          // an undefined value would make Roles.getUsersInRole(defaultRoles) return ALL users
          if (permission && typeof permission.permission === "string" && permission.permission.length) {
            defaultRoles.push(permission.permission);
          }
        }
      }
    }
  } else {
    Logger.debug(`No routes loaded for ${pkgName}`);
  }
  // only unique roles
  const defaultOwnerRoles = _.uniq(defaultRoles);
  // get existing shop owners to add new roles to
  const owners = [];
  const shopOwners = Roles.getUsersInRole(defaultOwnerRoles).fetch();
  // just a nice warning. something is misconfigured.
  if (!shopOwners) {
    Logger.warn("Cannot assign roles without existing owner users.");
    return;
  }
  // assign this package permission to each existing owner.
  for (const account of shopOwners) {
    owners.push(account._id);
  }
  // we don't use accounts/addUserPermissions here because we may not yet have permissions
  Roles.addUsersToRoles(owners, defaultOwnerRoles, shopId);

  // the reaction owner has permissions to all sites by default
  Roles.addUsersToRoles(owners, globalRoles, Roles.GLOBAL_GROUP);

  Logger.debug(`Owner permissions added for ${pkgName}`);
}
