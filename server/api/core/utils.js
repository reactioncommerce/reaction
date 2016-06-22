import { slugify } from "transliteration";

/**
 * getSlug - return a slugified string using "slugify" from transliteration
 * https://www.npmjs.com/package/transliteration
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  return slugString ? slugify(slugString) : "";
}
