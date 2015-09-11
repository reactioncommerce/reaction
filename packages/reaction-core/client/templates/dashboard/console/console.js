/**
 * consoleNavBar helpers
 *
 */

Template.consoleNavBar.helpers({
  displayConsoleDrawer: function() {
    if (Session.get('displayConsoleDrawer')) {
      return true;
    }
  },
  pkgPermissions: function() {
    if (ReactionCore.hasPermission('console')) {
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


/**
 * consoleNavBar events
 *
 */
 
Template.consoleNavBar.events({
  'click #dashboard-navbar-close-button': function() {
    return toggleSession("displayConsoleNavBar");
  },
  'click #dashboard-drawer-close-button': function() {
    return toggleSession("displayConsoleDrawer");
  }
});


/**
 * console widgets onRendered
 * located here rather than dashboard template
 * to rerun whenever a new widget is added
 */

Template.consoleWidgets.onRendered(function() {
  $(function() {
    var dashboardSwiper;
    return dashboardSwiper = $(".dashboard-container").swiper({
      direction: "horizontal",
      setWrapperSize: true,
      loop: false,
      slidesPerView: "auto",
      wrapperClass: "dashboard-widget-wrapper",
      slideClass: "dashboard-widget"
    });
  });
});
