// client slugify only works when import minified version.
import "transliteration/lib/browser/transliteration.min.js";

/**
 * getSlug - return a client slugified string using the "slugify"
 * global from the transliteration package
 * https://www.npmjs.com/package/transliteration
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  return slugString ? slugify(slugString) : "";
}
