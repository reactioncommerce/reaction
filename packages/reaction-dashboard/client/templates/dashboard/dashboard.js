//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let route = ReactionRouter.current().route.name;
    let registry = ReactionCore.getRegistryForCurrentRoute() || {};
    if (registry && route) {
      // TODO move this to a function and reuse with reactionApps in apps.js
      const registryLabel = registry.label ? registry.label.toCamelCase() : "";
      const i18nKey = `admin.${registry.provides}.${registryLabel}`;
      registry.i18nKeyLabel = `${i18nKey}Title`;
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
