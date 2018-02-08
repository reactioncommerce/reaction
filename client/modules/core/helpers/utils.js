// latin base chars ISO
const westernLangs = ["az", "da", "de", "en", "es", "ff", "fr", "ha", "hr", "hu", "ig", "is", "it", "jv", "ku", "ms", "nl", "no", "om", "pl", "pt", "ro", "sv", "sw", "tl", "tr", "uz", "vi", "yo"]; // eslint-disable-line max-len

// client get shop lang
const shopLang = new Promise((resolve, reject) => Meteor.call("shop/getBaseLanguage", (err, res) => err ? reject(err) : resolve(res)));


// TODO: better comments for this func
// TODO: conditional load based on shop lang
let slugify;
async function lazyLoadSlugify() {
  if (slugify) return;
  const lang = await shopLang;
  const mod = (westernLangs.indexOf(lang) >= 0) ? await import("slugify") : await import("transliteration");
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
