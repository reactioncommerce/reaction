import React from "react";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";

/**
 * Push package into action view navigation stack
 * @param  {SyntheticEvent} event Original event
 * @param  {Object} app Package data
 * @returns {undefined} No return value
 * @private
 */
function handleShowPackage(event, app) {
  Reaction.pushActionView(app);
}

/**
 * Open full dashboard menu
 * @returns {undefined} No return value
 * @private
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
 * Push dashboard & package into action view navigation stack
 * @param  {SyntheticEvent} event Original event
 * @param  {Object} app Package data
 * @returns {undefined} No return value
 * @private
 */
function handleOpenShortcut(event, app) {
  Reaction.hideActionViewDetail();
  Reaction.showActionView(app);
}

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const audience = Roles.getRolesForUser(Reaction.getUserId(), Reaction.getShopId());
  const settings = Reaction.Apps({ provides: "settings", enabled: true, audience }) || [];

  const dashboard = Reaction.Apps({ provides: "dashboard", enabled: true, audience })
    .filter((dash) => typeof Template[dash.template] !== "undefined") || [];

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

/**
 * @name PackageListContainer
 * @param {React.Component} Comp wrapped component
 * @returns {React.Component} returns a React component
 */
export default function PackageListContainer(Comp) {
  /**
   * @name CompositeComponent
   * @param {Object} props Component props
   * @returns {React.Component} Wrapped Toolbar component
   */
  function CompositeComponent(props) {
    return (
      <Comp {...props} />
    );
  }

  return composeWithTracker(composer)(CompositeComponent);
}
