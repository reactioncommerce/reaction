/**
 * @summary Extracts specified keys from a provided object
 * @param {Object} obj - The target object to filter keys from
 * @param {Array} keys - An array of white-listed keys to include in the returned object. 
 * @returns {Object} - An object containing only white-listed keys
 */
export function pick(obj, keys) {
  return keys.map(k => k in obj ? { [k]: obj[k] } : {})
    .reduce((res, o) => Object.assign(res, o), {});
}
