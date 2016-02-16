//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let route = ReactionRouter.current().route.name;
    let registry = ReactionCore.getRegistryForCurrentRoute() || {};
    if (registry && route) {
      // associate with template first, it's the natural relationship
      registry.nameSpace = registry.template || registry.name || "app";
      registry.i18nLabel = registry.label || registry.provides || route.charAt(0).toUpperCase() + route.slice(1);
      registry.i18nKey = registry.nameSpace.toCamelCase() + "." + registry.i18nLabel.toCamelCase();
      return registry;
    }
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
