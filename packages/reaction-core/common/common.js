
/**
 * Match.OptionalOrNull
 * See Meteor Match methods
 * @param {String} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};

/**
 * Match.OrderHookOption
 * See Meteor Match methods
 * @param {Object} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OrderHookOptions = function () {
  return Match.OneOf(Object);
};
