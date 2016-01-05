/**
 * Reaction startup
 *
 * Load app private fixtures
 */

Meteor.startup(function () {
  try {
    ReactionRegistry.loadSettings(Assets.getText("settings/reaction.json"));
  } catch (error) {
    if (Assets.getText("settings/reaction.json")) {
      ReactionCore.Log.warn("loadSettings reaction.json not loaded.", error);
    }
  }
});
