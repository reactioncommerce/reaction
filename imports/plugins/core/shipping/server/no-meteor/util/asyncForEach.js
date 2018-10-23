/**
 * @name asyncForEach 
 * @method
 * @summary async version of `forEach`
 * @param {Array} array - Array to iterate over
 * @param {Function} callback - function to execute against each item in the array
 * @return {undefined}
 */
export default async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
