
function pkgPermissions(pkg) {
  if (ReactionCore.hasPermission("dashboard")) {
    // route specific permissions
    if (pkg.route) {
      return ReactionCore.hasPermission(pkg.name);
    }
    // name is a global group role for packages
    if (pkg.name && pkg.template) {
      return ReactionCore.hasPermission(pkg.name);
    }
  }
  return false;
}

Template.packagesGrid.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: [],
    appsByGroup: {},
    apps: []
  });

  this.autorun(() => {
    const apps = ReactionCore.Apps({provides: "dashboard"});
    const groupedApps = _.groupBy(apps, (app) => {
      return app.container || "misc";
    });

    this.state.set("apps", apps);
    this.state.set("appsByGroup", groupedApps);
    this.state.set("groups", Object.keys(groupedApps));
  });
});

/**
 * packagesGrid helpers
 */
Template.packagesGrid.helpers({
  groups() {
    return Template.instance().state.get("groups");
  },

  appsInGroup(groupName) {
    const group = Template.instance().state.get("appsByGroup") || {};
    return group[groupName] || false;
  },

  shopId: function () {
    return ReactionCore.getShopId();
  },
  pkgPermissions
});

Template.packagesGridGroup.helpers({
  pkgPermissions
});
