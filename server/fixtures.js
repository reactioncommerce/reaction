/**
 * Reaction startup
 *
 * Load app private fixtures
 */

Meteor.startup(function () {
  try {
    ReactionRegistry.loadSettings(Assets.getText("settings/reaction.json"));
  } catch (error) {
    try {
      Assets.getText("settings/reaction.json");
    } catch (error2) {
      ReactionCore.Log.warn("loadSettings reaction.json not loaded.", error2);
    }
  }
});
