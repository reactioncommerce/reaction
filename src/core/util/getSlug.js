import { slugify } from "transliteration";

/**
 * @name getSlug
 * @summary Return a slugified string using "slugify" from transliteration
 * @see https://www.npmjs.com/package/transliteration
 * @method
 * @memberof Helpers
 * @locus Server
 * @param  {String} slugString - string to slugify
 * @returns {String} slugified string
 */
export default function getSlug(slugString) {
  return (typeof slugString === "string" && slugify(slugString)) || "";
}
