/**
 * dashboard events
 *
 * routes console links to packages routes from ReactionRegistry
 */

// Template.dashboardControls.events({
//   "click .dashboard-navbar-package": function (event) {
//     event.preventDefault();
//     if (this.route !== null) {
//       Session.set("currentPackage", this.route);
//       return ReactionRouter.go("/" + this.route);
//     }
//   }
// });

Template.dashboardHeader.helpers({
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let registry = ReactionCore.getRegistryForCurrentRoute("dashboard") || {};
    registry.nameSpace = registry.name || registry.template || "app";
    registry.i18nLabel = registry.label || registry.provides || "Dashboard";
    registry.i18nKey = registry.nameSpace.toCamelCase() + "." + registry.i18nLabel
      .toCamelCase();
    return registry;
  }
});

Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]": function () {
    ReactionCore.showActionView();
  }
});
