/**
 * packagesGrid helpers
 *
 */
Template.packagesGrid.helpers({
  pkgPermissions: function () {
    if (ReactionCore.hasPermission("dashboard")) {
      if (this.route) {
        return ReactionCore.hasPermission(this.route);
      }
      return ReactionCore.hasPermission(this.name);
    }
    return false;
  }
});
