import { Themes } from "/lib/collections";

/**
 * Themes
 * @returns {Object} thtmes - themes cursor
 */

Meteor.publish("Themes", function () {
  return Themes.find({});
});
