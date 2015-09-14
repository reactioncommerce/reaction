/**
* Reaction startup
*
* Load app private fixtures
*/

Meteor.startup(function() {
  try {
    return Fixtures.loadSettings(Assets.getText("settings/reaction.json"));
  } catch (_error) {
    ReactionCore.Events.info("No preconfiguration found. Use `private/settings/reaction.json`.");
  }
});
