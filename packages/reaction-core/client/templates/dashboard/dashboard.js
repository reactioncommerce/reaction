/**
 * dashboard helpers
 *
 * manages view / permissions for the console
 */

Template.dashboard.helpers({
  route: function () {
    return Router.current().route.getName();
  },
  displayConsoleNavBar: function () {
    if (ReactionCore.hasPermission("console") && Session.get(
        "displayConsoleNavBar")) {
      return true;
    }
  },
  displayConsoleDrawer: function () {
    if (ReactionCore.hasPermission("console") && Session.get(
        "displayConsoleDrawer")) {
      return true;
    }
  }
});

/**
 * dashboard events
 *
 * routes console links to packages routes from ReactionRegistry
 */

Template.dashboard.events({
  "click .dashboard-navbar-package": function (event) {
    Session.set("currentPackage", this.route);
    if (this.route !== null) {
      event.preventDefault();
      return Router.go(this.route);
    }
  }
});

Template.dashboardHeader.helpers({
  showHeader: function () {
    if (Router.current().route.getName().indexOf("dashboard") === 0) {
      return true;
    }

    return false;
  },

  "registry": function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let registry = ReactionCore.getRegistryForCurrentRoute("dashboard") || {};
    registry.nameSpace = registry.name || registry.template || "app";
    registry.i18nLabel = registry.label || registry.provides ||
      "Settings";
    registry.i18nKey = registry.nameSpace.toCamelCase() + "." + registry.i18nLabel
      .toCamelCase();
    return registry;
  },

  thisDashboard: function () {
    return ReactionCore.getRegistryForCurrentRoute("dashboard");
  }

});

Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]": function () {
    ReactionCore.showActionView();
  }
});
