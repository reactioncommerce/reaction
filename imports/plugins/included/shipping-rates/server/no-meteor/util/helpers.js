/**
 * @name asyncForEach
 * @method
 * @summary async version of `forEach`
 * @param {Array} array - Array to iterate over
 * @param {Function} callback - function to execute against each item in the array
 * @return {undefined}
 */
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/**
 * @name pick
 * @summary Extracts specified keys from a provided object
 * @param {Object} obj - The target object to filter keys from
 * @param {Array} keys - An array of white-listed keys to include in the returned object.
 * @returns {Object} - An object containing only white-listed keys
 */
export function pick(obj, keys) {
  return keys.map(k => k in obj ? { [k]: obj[k] } : {})
    .reduce((res, o) => Object.assign(res, o), {});
}

/**
 * @name tagsByIds
 * @summary Finds a product's tags by their ids
 * @param {Object} collections - The mongo collections
 * @param {Array} tagIds - An array of tag ids.
 * @returns {Array} - An array of tags associated with the provided tag ids.
 */
export async function tagsByIds(collections, tagIds) {
  const { Tags } = collections;
  const tagNames = [];

  const tags = await Tags.find({ _id: { $in: tagIds } }).toArray();
  tags.forEach((tag) => tagNames.push(tag.name));

  return tagNames;
}



export const operators = {
  "eq": function(a, b) { return a === b},
  "gt": function(a, b) { return a > b},
  "lt": function(a, b) { return a < b },
  "ne": function(a, b) { return a !== b}
};

export const propertyTypes = {
  "bool": function(a) { return a === "true" },
  "float": function(a) { return parseFloat(a) },
  "int": function(a) { return parseInt(a) },
  "string": function(a) { return a }
}

