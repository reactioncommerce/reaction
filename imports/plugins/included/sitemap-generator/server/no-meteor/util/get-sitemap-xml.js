/**
 * @name getSitemapXML
 * @summary Loads and returns the XML for one of a shop's sitemaps
 * @param {Object} context App context
 * @param {String} shopId - _id of shop sitemap belongs to
 * @param {String} handle - Sitemap's handle, as set in Sitemaps collection
 * @returns {String} - XML, with placeholders replaced (BASE_URL, LAST_MOD), or "" if not found
 */
export default async function getSitemapXML(context, shopId, handle) {
  const { collections: { Sitemaps } } = context;

  const sitemap = await Sitemaps.findOne({ shopId, handle });
  if (!sitemap) return "";

  let { xml } = sitemap;

  // Replace BASE_URL with actual URL
  const urlNoTrailingSlash = context.rootUrl.slice(0, -1);
  xml = xml.replace(/BASE_URL/g, urlNoTrailingSlash);

  return xml;
}
