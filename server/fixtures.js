/**
* Reaction startup
*
* Load app private fixtures
*/

Meteor.startup(function() {
  try {
    return Fixtures.loadSettings(Assets.getText("settings/reaction.json"));
  } catch (_error) {
    ReactionCore.Events.info("No configuration loaded from settings/reaction.json.", _error);
  }
});
