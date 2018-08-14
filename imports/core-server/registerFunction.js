const functionsByType = {};

/**
 * @summary Register a certain type of function by name
 * @param {String} type A function type, which should be something expected and used by one of the services
 * @param {Function} func The function to run when a service runs this type of function
 * @returns {undefined}
 */
export function registerFunction(type, func) {
  if (!functionsByType[type]) functionsByType[type] = [];
  functionsByType[type].push(func);
}

/**
 * @summary Gets the full list of functions that have been registered for `type`
 * @param {String} type The function type
 * @returns {Function[]} A potentially empty array of functions
 */
export function getRegisteredFunctionsForType(type) {
  return functionsByType[type] || [];
}
