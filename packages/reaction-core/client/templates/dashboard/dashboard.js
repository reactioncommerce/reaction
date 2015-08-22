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
