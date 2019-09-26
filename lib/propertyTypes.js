/**
 * @name propertyTypes
 * @constant
 * @memberof Helpers
 * @summary Checks matching via various operators
 * @returns {Boolean} the result of the check
 */
export default {
  bool(varA) { return varA.trim().toLowerCase() === "true"; },
  float(varA) { return parseFloat(varA); },
  int(varA) { return parseInt(varA, 10); },
  string(varA) { return varA; }
};
