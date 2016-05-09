import { Reaction } from "/client/modules/core";
import { ReactionRouter } from "/client/modules/router";
import { Packages } from "/lib/collections";

/**
 * Helpers for Settings Header (actionView)
 */
Template.settingsHeader.helpers({

  /**
   * Data pased to action view
   * @return {Object} Registry entry for item
   */
  registry: function () {
    return Reaction.getActionView() || {};
  },

  /**
   * thisApp
   * @return {Object} Registry entry for item
   */
  thisApp() {
    let reactionApp = Packages.findOne({
      "registry.provides": "settings",
      "registry.route": ReactionRouter.getRouteName()
    }, {
      enabled: 1,
      registry: 1,
      name: 1,
      route: 1
    });

    if (reactionApp) {
      let settingsData = _.find(reactionApp.registry, function (item) {
        return item.route === ReactionRouter.getRouteName() && item.provides === "settings";
      });

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
