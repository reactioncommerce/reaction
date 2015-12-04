
/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  ReactionImport.startup();
  ReactionCore.init();
  // we've finished all reaction core initialization
  ReactionCore.Log.info("Reaction initialization finished.");
});
