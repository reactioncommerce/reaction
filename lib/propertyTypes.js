/**
 * @name propertyTypes
 * @constant
 * @memberof Helpers
 * @summary Normalizes values out to various property types
 * @returns {Boolean|String|Number|Integer|Array}
 */
export default {
  bool(varA) { return varA.trim().toLowerCase() === "true"; },
  float(varA) { return parseFloat(varA); },
  int(varA) { return parseInt(varA, 10); },
  string(varA) { return varA; },
  array(varA) { return varA; }
};
