/**
 * Helpers for Settings Header (actionView)
 */
Template.settingsHeader.helpers({

  /**
   * Data pased to action view
   * @return {Object} Registry entry for item
   */
  registry: function () {
    // just some handle little helpers for default package i18nKey/i18nLabel
    let registry = ReactionCore.getActionView() || {};
    registry.nameSpace = registry.name || registry.template || "app";
    registry.i18nLabel = registry.label || registry.provides || "Settings";
    registry.i18nKey = registry.nameSpace.toCamelCase() + "." + registry.i18nLabel.toCamelCase();
    return registry;
  },

  /**
   * thisApp
   * @return {Object} Registry entry for item
   */
  thisApp() {
    let reactionApp = ReactionCore.Collections.Packages.findOne({
      "registry.provides": "settings",
      "registry.route": Router.getRouteName()
    }, {
      enabled: 1,
      registry: 1,
      name: 1,
      route: 1
    });

    if (reactionApp) {
      let settingsData = _.find(reactionApp.registry, function (item) {
        return item.route === Router.getRouteName() && item.provides === "settings";
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
    ReactionCore.hideActionView();
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
    if (ReactionCore.hasPermission("dashboard")) {
      if (this.route) {
        return ReactionCore.hasPermission(this.route);
      }

      return ReactionCore.hasPermission(this.name);
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
  },

  /**
   * active
   * @param {String} route Route for item
   * @return {String} "active" || ""
   */
  active(route) {
    if (route === Router.getRouteName()) {
      return "active";
    }

    return "";
  }
});
