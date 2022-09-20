/**
 * @name propertyTypes
 * @constant
 * @memberof Helpers
 * @summary Converts string values to other types
 * @returns {Boolean|String|Number|Integer|Array}
 */
export default {
  bool(varA) { return varA.trim().toLowerCase() === "true"; },
  float(varA) { return parseFloat(varA); },
  int(varA) { return parseInt(varA, 10); },
  string(varA) { return varA; }
};
