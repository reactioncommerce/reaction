import { latinLangs, getShopLang } from "/lib/api/helpers";

// dynamic import of slugiy/transliteration.slugify
let slugify;
async function lazyLoadSlugify() {
  let mod;
  // getting the shops base language
  const lang = getShopLang();
  // if slugify has been loaded but the language has changed
  // to be a non latin based language then load transliteration
  if (slugify && slugify.name === "replace" && latinLangs.indexOf(lang) === -1) {
    mod = await import("transliteration");
  } else if (slugify) {
    // if slugify/transliteration is loaded and no lang change
    return;
  } else if (latinLangs.indexOf(lang) >= 0) {
    // if the shops language use latin based chars load slugify else load transliterations's slugify
    mod = await import("slugify");
  } else {
    mod = await import("transliteration");
  }

  // slugify is exported to modules.default while transliteration is exported to modules.slugify
  slugify = mod.default || mod.slugify;
}


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
  let slug;
  Promise.resolve(lazyLoadSlugify());
  if (slugString && slugify) {
    slug = slugify(slugString.toLowerCase());
  } else {
    slug = "";
  }
  return slug;
}
