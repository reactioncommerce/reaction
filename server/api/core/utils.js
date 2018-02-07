// TODO: better comments for this func
// TODO: conditional load based on shop lang
let slugify;
async function lazyLoadSlugify() {
  if (slugify) return;
  const mod = await import("transliteration");
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
