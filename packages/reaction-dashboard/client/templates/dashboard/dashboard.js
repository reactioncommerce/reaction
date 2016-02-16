//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let route = ReactionRouter.getRouteName();
    let registry = ReactionCore.getRegistryForCurrentRoute() || {};

    registry.nameSpace = registry.name || registry.template || "app";
    registry.i18nLabel = registry.label || registry.provides || route.charAt(0).toUpperCase() + route.slice(1);
    registry.i18nKey = registry.nameSpace.toCamelCase() + "." + registry.i18nLabel.toCamelCase();
    return registry;
  }
});


//
// dashboard events
//
Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]": function () {
    ReactionCore.showActionView();
  }
});
