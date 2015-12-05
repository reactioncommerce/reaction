/**
 * Reaction startup
 *
 * Load app private fixtures
 */

Meteor.startup(function () {
  try {
    return ReactionRegistry.loadSettings(Assets.getText("settings/reaction.json"));
  } catch (error) {
    ReactionCore.Log.debug("loadSettings reaction.json not loaded.", error);
  }
});
