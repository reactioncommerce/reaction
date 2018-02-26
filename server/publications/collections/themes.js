import { Meteor } from "meteor/meteor";
import { Themes } from "/lib/collections";

/**
 * Themes
 * @returns {Object} thtmes - themes cursor
 */

Meteor.publish("Themes", () => Themes.find({}));
