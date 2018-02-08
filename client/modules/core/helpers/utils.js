import { latinLangs } from "/lib/api/helpers";

// Wrapping the server metod/callback with a Promise
// so the shops base language can be set as a const
// using await inside the lazyLoadSlugify function
const shopLang = new Promise((resolve, reject) => Meteor.call("shop/getBaseLanguage", (err, res) => err ? reject(err) : resolve(res)));

// dynamic import of slugiy/transliteration.slugify
let slugify;
async function lazyLoadSlugify() {
  if (slugify) return;
  // getting the shops base language
  const lang = await shopLang;
  // if the shops language use latin based chars load slugify else load transliterations's slugify
  const mod = (latinLangs.indexOf(lang) >= 0) ? await import("slugify") : await import("transliteration");
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
  Promise.resolve(lazyLoadSlugify());
  return (slugString && slugify) ? slugify(slugString) : "";
}
