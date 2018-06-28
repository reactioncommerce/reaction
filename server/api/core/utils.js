import { slugify } from "transliteration";
import { replacementOptions } from "/lib/api/helpers";

/**
 * @name getSlug
 * @summary Return a slugified string using "slugify" from transliteration
 * @see https://www.npmjs.com/package/transliteration
 * @method
 * @memberof Helpers
 * @locus Server
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  slugify.config({
    replace:
      replacementOptions
  });
  console.log(slugify(slugString));
  return (typeof slugString === "string" && slugify(slugString)) || "";
}
