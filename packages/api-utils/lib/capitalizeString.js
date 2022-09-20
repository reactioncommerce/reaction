/**
 * @name capitalizeString
 * @constant
 * @memberof Helpers
 * @param {String} string string to capitlize
 * @param {Object} options options for capitalization
 * @param {Object} options.titleCase capitalize first letter of all words
 * @summary Capitalizes letters of a string
 * @returns {String} original string, transformed with capitalizations
 */
export default function capitalizeString(string, options) {
  if (!string) return null;

  if (options && options.titleCase) {
    const str = string.toLowerCase().split(" ");
    for (let i = 0; i < str.length; i++) { // eslint-disable-line
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(" ");
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}
