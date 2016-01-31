/**
 * ReactionRegistry.assignOwnerRoles
 * populate roles with all the packages and their permissions
 * this way the default user has all permissions
 * @param  {String} shopId - shopId
 * @param  {String} registry - registry object
 * @return {undefined}        [description]
 */

ReactionRegistry.assignOwnerRoles = (shopId, pkgName, registry) => {
  const defaultAdminRoles = ["owner", "admin", "guest", "account/profile"];

  defaultAdminRoles.push(pkgName);
  for (let registryItem of registry) {
    // default is that packages don't need to define specific
    // permissions to routes.
    if (registryItem.route) {
      defaultAdminRoles.push(registryItem.route);
    }
    // Get all defined permissions, add them to an array
    // define permissions if you need to check custom permission
    if (registryItem.permissions) {
      for (let permission of registryItem.permissions) {
        defaultAdminRoles.push(permission);
      }
    }
  }

  //
  // add new roles to all existing shop owners
  //

  const shopOwners = Roles.getUsersInRole(defaultAdminRoles).fetch();
  for (let account of shopOwners) {
    // curent roles
    const currentShopOwnerRoles = account.roles[shopId];
    const currentGlobalRoles = account.roles.__global_roles__;
    // merge to form new role array while preserving existing assignments
    const updatedShopOwnerRoles = Object.assign({}, defaultAdminRoles, currentShopOwnerRoles);
    const updatedGlobalRoles = Object.assign({}, defaultAdminRoles, currentGlobalRoles);
    // we don't use accounts/addUserPermissions here because we may not yet have permissions
    Roles.setUserRoles(account._id, _.uniq(updatedShopOwnerRoles), shopId);
    // the reaction owner has permissions to all sites by default
    Roles.setUserRoles(account._id, _.uniq(updatedGlobalRoles), Roles.GLOBAL_GROUP);
  }
  ReactionCore.Log.info(`Owner permissions added for ${pkgName}`);
};
