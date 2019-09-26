
/**
 * @name operators
 * @constant
 * @memberof Helpers
 * @summary Checks matching via various operators
 * @returns {Boolean} the result of the check
 */
export default {
  eq(varA, varB) { return varA === varB; },
  gt(varA, varB) { return varA > varB; },
  lt(varA, varB) { return varA < varB; },
  ne(varA, varB) { return varA !== varB; }
};
