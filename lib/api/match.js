import { Match } from "meteor/check";

/**
 * @file **Meteor Match** - Extending {@link http://docs.meteor.com/api/check.html Meteor Match} argument checking
 * @see https://github.com/meteor/meteor/tree/master/packages/check
 * @extends Meteor/Check
 * @namespace Match
 */

/**
 * @name OptionalOrNull
 * @method
 * @memberof Match
 * @summary Return whether an argument is optional or null
 * @example check(options, Match.OptionalOrNull(Object))
 * @param {String} pattern - match pattern
 * @return {Boolean} matches - void, null, or pattern
 */
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(undefined, null, pattern);
};

/**
 * @name OrderHookOption
 * @method
 * @memberof Match
 * @example check(options, Match.OrderHookOptions())
 * @return {Boolean} matches - void, null, or pattern
 */
Match.OrderHookOptions = function () {
  return Match.OneOf(Object);
};
