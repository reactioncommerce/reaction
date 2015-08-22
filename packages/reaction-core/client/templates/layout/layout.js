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
