/**
 * ReactionRegistry.assignOwnerRoles
 * populate roles with all the packages and their permissions
 * this is the main way that roles are inserted and created for
 * admin user. Packages alone do not create the permissions
 *
 * we assign all package roles to each owner account for each shopId
 * we assign only basic GLOBAL_GROUP rights
 *
 * @param  {String} shopId - shopId
 * @param  {String} pkgName - Package name
 * @param  {String} registry - registry object
 * @return {undefined}
 */

ReactionRegistry.assignOwnerRoles = (shopId, pkgName, registry) => {
  const defaultRoles = ["owner", "admin", "createProduct", "guest", pkgName];
  const globalRoles = defaultRoles;

  if (registry) {
      // for each registry item define and push roles
    for (let registryItem of registry) {
      // default is that packages don't need to define specific
      // permissions to routes.
      if (registryItem.route && registryItem.template && registryItem.provides) {
        defaultRoles.push(pkgName + "/" + registryItem.provides);
        defaultRoles.push(registryItem.route);
      }
      // Get all defined permissions, add them to an array
      // define permissions if you need to check custom permission
      if (registryItem.permissions) {
        for (let permission of registryItem.permissions) {
          defaultRoles.push(permission.permission);
        }
      }
    }
  } else {
    ReactionCore.Log.info(`No routes loaded for ${pkgName}`);
  }
  // only unique roles
  const defaultOwnerRoles = _.uniq(defaultRoles);
  // get existing shop owners to add new roles to
  const owners = [];
  const shopOwners = Roles.getUsersInRole(defaultOwnerRoles).fetch();
  // just a nice warning. something is misconfigured.
  if (!shopOwners) {
    ReactionCore.Log.warn("Cannot assign roles without existing owner users.");
    return;
  }
  // assign this package permission to each existing owner.
  for (let account of shopOwners) {
    owners.push(account._id);
  }
  // we don't use accounts/addUserPermissions here because we may not yet have permissions
  Roles.addUsersToRoles(owners, defaultOwnerRoles, shopId);

  // the reaction owner has permissions to all sites by default
  Roles.addUsersToRoles(owners, globalRoles, Roles.GLOBAL_GROUP);

  ReactionCore.Log.debug(`Owner permissions added for ${pkgName}`);
};
