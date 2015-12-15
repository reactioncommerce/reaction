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
