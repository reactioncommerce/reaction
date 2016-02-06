/**
 * packagesGrid helpers
 *
 */
Template.packagesGrid.helpers({
  shopId: function () {
    return ReactionCore.getShopId();
  },
  pkgPermissions: function () {
    if (ReactionCore.hasPermission("dashboard")) {
      // route specific permissions
      if (this.route) {
        return ReactionCore.hasPermission(this.route);
      }
      // name is a global group role for packages
      if (this.name) {
        return ReactionCore.hasPermission(this.name);
      }
    }
    return false;
  }
});
