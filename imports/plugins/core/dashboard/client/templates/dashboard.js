import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { translateRegistry } from "/lib/api";

//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry() {
    // just some handle little helpers for default package i18nKey/i18nLabel
    const route = Reaction.Router.getRouteName();
    const registry = Reaction.getRegistryForCurrentRoute() || {};
    if (registry && route) {
      return translateRegistry(registry);
    }
  }
});

//
// dashboard events
//
Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]"() {
    Reaction.showActionView();
  }
});
