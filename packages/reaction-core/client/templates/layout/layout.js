/**
* coreHead helpers
* used to define layout for routes
* see: common/routing.coffee
*/

Template.coreHead.helpers({
  metaData: function(metaData) {
    return ReactionCore.MetaData;
  }
});






Template.coreAdminLayout.onRendered(function () {

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
  },

});
