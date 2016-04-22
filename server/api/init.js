
/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  ReactionCore.init();
  // we've finished all reaction core initialization
  ReactionCore.Log.info("Reaction initialization finished.");
});
