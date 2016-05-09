import { Reaction } from "/client/modules/core";
import { ReactionRouter } from "/client/modules/router";

//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let route = ReactionRouter.getRouteName();
    let registry = Reaction.getRegistryForCurrentRoute() || {};
    if (registry && route) {
      return Reaction.translateRegistry(registry);
    }
  }
});

//
// dashboard events
//
Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]": function () {
    Reaction.showActionView();
  }
});
