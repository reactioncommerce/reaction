//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let route = ReactionRouter.current().route.name;
    let registry = ReactionCore.getRegistryForCurrentRoute() || {};
    if (registry && route) {
      return ReactionCore.translateRegistry(registry);
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
