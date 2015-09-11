/**
 * consoleIcon helpers
 *
 */

Template.consoleIcon.helpers({
  toggleStateClass: function() {
    var state;
    state = Session.get("displayConsoleNavBar");
    if (state === true) {
      return "fa fa-dashboard dashboard-state-active";
    } else {
      return "fa fa-dashboard";
    }
  }
});

/**
 * consoleIcon events
 *
 */
Template.consoleIcon.events({
  "click #dashboard-drawer-icon": function(event, template) {
    event.preventDefault();
    return toggleSession("displayConsoleNavBar");
  }
});
