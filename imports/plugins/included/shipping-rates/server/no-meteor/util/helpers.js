// TODO: EK - merge this into a central location

/**
 * @constant
 * @type {Object}
*/
export const operators = {
  eq(varA, varB) { return varA === varB; },
  gt(varA, varB) { return varA > varB; },
  lt(varA, varB) { return varA < varB; },
  ne(varA, varB) { return varA !== varB; }
};

/**
 * @constant
 * @type {Object}
*/
export const propertyTypes = {
  bool(varA) { return varA.trim().toLowerCase() === "true"; },
  float(varA) { return parseFloat(varA); },
  int(varA) { return parseInt(varA, 10); },
  string(varA) { return varA; }
};
