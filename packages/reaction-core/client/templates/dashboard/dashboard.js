/**
 * dashboard helpers
 *
 * manages view / permissions for the console
 */

Template.dashboard.helpers({
  route: function() {
    return Router.current().route.getName();
  },
  displayConsoleNavBar: function() {
    if (ReactionCore.hasPermission('console') && Session.get("displayConsoleNavBar")) {
      return true;
    }
  },
  displayConsoleDrawer: function() {
    if (ReactionCore.hasPermission('console') && Session.get("displayConsoleDrawer")) {
      return true;
    }
  }
});

/**
 * dashboard events
 *
 * routes console links to packages routes from ReactionRegistry
 */

Template.dashboard.events({
  'click .dashboard-navbar-package': function(event, template) {
    Session.set("currentPackage", this.route);
    if (this.route != null) {
      event.preventDefault();
      return Router.go(this.route);
    }
  }
});


var getRegistryForDashboard = function (provides) {
  var reactionApp = ReactionCore.Collections.Packages.findOne({
    "registry.provides": provides,
    "registry.route": Router.current().route.getName()
  }, {
    'enabled': 1,
    'registry': 1,
    'name': 1,
    'route': 1
  });

  if (reactionApp) {
    var settingsData = _.find(reactionApp.registry, function (item) {
      return item.route == Router.current().route.getName() && item.provides === provides;
    });

    return settingsData;
  }

  return null;
};


Template.dashboardHeader.helpers({
  showHeader: function () {
    if (Router.current().route.path().indexOf("/dashboard/") === 0) {
      return true;
    }

    return false;
  },

  "registry": function () {

    console.log("this!!!", this)

    // just some handle little helpers for default package i18nKey/i18nLabel
    var registry = getRegistryForDashboard("dashboard") || {};
    registry.nameSpace = registry.name || registry.template || "app";
    registry.i18nLabel = registry.label || registry.provides || "Settings";
    registry.i18nKey = registry.nameSpace.toCamelCase() + "." + registry.i18nLabel.toCamelCase();
    return registry;
  },

  thisDashboard: function () {
    var reactionApp = ReactionCore.Collections.Packages.findOne({
      "registry.provides": "dashboard",
      "registry.route": Router.current().route.getName()
    }, {
      'enabled': 1,
      'registry': 1,
      'name': 1,
      'route': 1
    });

    if (reactionApp) {
      var settingsData = _.find(reactionApp.registry, function (item) {
        return item.route == Router.current().route.getName() && item.provides === "dashboard";
      });

      return settingsData;
    }
    return reactionApp;
  }



});


Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]": function () {

    var registryEntry = ReactionCore.getRegisryForCurrentRoute("settings");

    if (registryEntry) {
      ReactionCore.showAdvancedSettings(registryEntry);
    }

  }
});
