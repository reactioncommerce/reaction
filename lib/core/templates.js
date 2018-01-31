/**
 * @name html
 * @method
 * @memberof Core
 * @summary Template literal for HTML strings.
 * @param  {Object} strings Object of strings
 * @return {String} string
 */
export function html(strings) {
  return strings.raw[0];
}
