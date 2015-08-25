

Template.settingsHeader.helpers({
  "thisApp": function () {

    var fields = {
      'enabled': 1,
      'registry': 1,
      'name': 1
    };

    var reactionApp = ReactionCore.Collections.Packages.findOne({
      "registry.provides": "settings",
      "registry.route": Router.current().route.getName()
    }, {
      'enabled': 1,
      'registry': 1,
      'name': 1,
      'route': 1
    });


    if (reactionApp) {
      var settingsData = _.find(reactionApp.registry, function (item) {
        return item.route == Router.current().route.getName() && item.provides == "settings"
      })

      console.log('Settings Data', settingsData);

      return settingsData;
    }
    console.table(reactionApp);

    return reactionApp;

  }
});


// Templte.settingsSidebar.inheritsHelpersFrom("packagesGrid");

Template.settingsSidebar.helpers({
  pkgPermissions: function() {
    if (ReactionCore.hasPermission('dashboard')) {
      if (this.route) {
        return ReactionCore.hasPermission(this.route);
      } else {
        return ReactionCore.hasPermission(this.name);
      }
    } else {
      return false;
    }
  }
});

Template.settingsSidebarItem.helpers({
  "label": function() {
    return this.label || Template.parentData(1).label
  },

  "active": function (route) {
    if (route === Router.current().route.getName()) {
      return "active";
    }

    return "";
  }
});
