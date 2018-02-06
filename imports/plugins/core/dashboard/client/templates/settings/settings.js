import _ from "lodash";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";

/**
 * Helpers for Settings Header (actionView)
 */
Template.settingsHeader.helpers({

  /**
   * Data pased to action view
   * @return {Object} Registry entry for item
   */
  registry() {
    return Reaction.getActionView() || {};
  },

  isActionViewAtRootView() {
    return Reaction.isActionViewAtRootView();
  },

  /**
   * thisApp
   * @return {Object} Registry entry for item
   */
  thisApp() {
    const reactionApp = Packages.findOne({
      "registry.provides": "settings",
      "registry.route": Reaction.Router.getRouteName()
    }, {
      enabled: 1,
      registry: 1,
      name: 1,
      route: 1
    });

    if (reactionApp) {
      const settingsData = _.find(reactionApp.registry, (item) => item.route === Reaction.Router.getRouteName() && item.provides && item.provides.includes("settings")); // eslint-disable-line max-len

      return settingsData;
    }
    return reactionApp;
  }

});

/**
 * Events for Setting Header (actionView)
 */
Template.settingsHeader.events({
  "click [data-event-action=closeSettings]": () => {
    Reaction.hideActionView();
  },

  "click .js-back-button"() {
    Reaction.popActionView();
  }
});

/**
 * Helpers for Settings Sidebar (actionView)
 */
Template.settingsSidebar.helpers({

  /**
   * pkgPermissions Check package permissions
   * @return {Boolean} user has permission to see settings for this package
   */
  pkgPermissions() {
    if (Reaction.hasPermission("dashboard")) {
      if (this.name) {
        return Reaction.hasPermission(this.name);
      }

      return Reaction.hasPermission(this.name);
    }

    return false;
  }
});

Template.settingsSidebarItem.helpers({

  /**
   * label
   * @return {String} Label for item
   */
  label() {
    return Template.parentData(1).label || this.label;
  }
});
