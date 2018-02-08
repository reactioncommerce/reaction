import { latinLangs } from "/lib/api/helpers";

// dynamic import of slugiy/transliteration.slugify
let slugify;
async function lazyLoadSlugify() {
  if (slugify) return;
  // getting the shops base language
  const lang = Meteor.call("shop/getBaseLanguage");
  // if the shops language use latin based chars load slugify else load transliterations's slugify
  const mod = (latinLangs.indexOf(lang) >= 0) ? await import("slugify") : await import("transliteration");
  // slugify is exported to modules.default while transliteration is exported to modules.slugify
  slugify = mod.default || mod.slugify;
}

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
  Promise.await(lazyLoadSlugify());
  return (slugString && slugify) ? slugify(slugString) : "";
}
