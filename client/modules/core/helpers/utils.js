import { slugify } from "transliteration";

/**
 * @name getSlug
 * @summary Return a client slugified string using the "slugify" global from the transliteration package
 * @see https://www.npmjs.com/package/transliteration
 * @method
 * @memberof Helpers
 * @locus Client
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  return slugString ? slugify(slugString) : "";
}
