import React from "react";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";

/**
 * handleShowPackage - Push package into action view navigation stack
 * @param  {SyntheticEvent} event Original event
 * @param  {Object} app Package data
 * @return {undefined} No return value
 */
function handleShowPackage(event, app) {
  Reaction.pushActionView(app);
}

/**
 * handleShowDashboard - Open full dashbaord menu
 * @return {undefined} No return value
 */
function handleShowDashboard() {
  Reaction.hideActionViewDetail();
  Reaction.showActionView({
    i18nKeyTitle: "dashboard.coreTitle",
    title: "Dashboard",
    template: "dashboardPackages"
  });
}

/**
 * handleOpenShortcut - Push dashbaord & package into action view navigation stack
 * @param  {SyntheticEvent} event Original event
 * @param  {Object} app Package data
 * @return {undefined} No return value
 */
function handleOpenShortcut(event, app) {
  Reaction.hideActionViewDetail();
  Reaction.showActionView(app);
}

function composer(props, onData) {
  const audience = Roles.getRolesForUser(Meteor.userId(), Reaction.getShopId());
  const settings = Reaction.Apps({ provides: "settings", enabled: true, audience }) || [];

  const dashboard = Reaction.Apps({ provides: "dashboard", enabled: true, audience })
    .filter((d) => typeof Template[d.template] !== "undefined") || [];

  onData(null, {
    currentView: Reaction.getActionView(),
    groupedPackages: {
      actions: {
        title: "Actions",
        i18nKeyTitle: "admin.dashboard.packageGroupActionsLabel",
        packages: dashboard
      },
      settings: {
        title: "Settings",
        i18nKeyTitle: "admin.dashboard.packageGroupSettingsLabel",
        packages: settings
      }
    },

    // Callbacks
    handleShowPackage,
    handleShowDashboard,
    handleOpenShortcut
  });
}

export default function PackageListContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <Comp {...props} />
    );
  }

  return composeWithTracker(composer)(CompositeComponent);
}
