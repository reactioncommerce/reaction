/**
 * Themes
 * @returns {Object} thtmes - themes cursor
 */

Meteor.publish("Themes", function () {
  return ReactionCore.Collections.Themes.find({});
});
