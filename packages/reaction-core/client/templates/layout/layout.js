/**
 * coreHead helpers
 * used to define layout for routes
 * see: common/routing.js
 */

Template.coreHead.helpers({
  metaData: function () {
    return ReactionCore.MetaData;
  }
});

Template.coreAdminLayout.helpers({
  template: function () {
    return ReactionCore.getActionView();
  },

  adminControlsClassname: function () {
    if (ReactionCore.isActionViewOpen()) {
      return "show-settings";
    }
    return "";
  }
});

Template.coreAdminLayout.events({
  "click [data-event-action=showPackageSettings]": function () {
    ReactionCore.showActionView();
  }
});
