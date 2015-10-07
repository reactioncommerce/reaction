/**
 * Reaction startup
 *
 * Load app private fixtures
 */

Meteor.startup(function () {
  try {
    return Fixtures.loadSettings(Assets.getText("settings/reaction.json"));
  } catch (error) {
    ReactionCore.Log.debug("loadSettings reaction.json not loaded.", error);
  }
});
