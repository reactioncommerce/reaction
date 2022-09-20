/**
 * @name sitemapQuery
 * @method
 * @summary Retrieves a sitemap objcet given a handle and shopUrl
 * @param {Object} context - an object containing the per-request state
 * @param {String} handle - Sitemap's handle, as set in Sitemaps collection
 * @param {String} shopUrl - URL of the shop the sitemap belongs to. The URL is used to find the shop with the domain of the URL
 * @returns {String} - Sitemap object containing XML with placeholders replaced (BASE_URL, LAST_MOD)
 */
export default async function sitemapQuery(context, { handle, shopUrl }) {
  const { Sitemaps, Shops } = context.collections;
  const domain = new URL(shopUrl.trim()).hostname;
  const trimmedHandle = handle.trim();

  // ensure the domain requested is for a known shop domain
  const { _id: shopId } = await Shops.findOne({ domains: domain }) || {};

  if (!shopId) return null;

  const sitemap = await Sitemaps.findOne({ shopId, handle: trimmedHandle });

  if (!sitemap) return null;

  sitemap.xml = sitemap.xml.replace(/BASE_URL/g, shopUrl);

  return sitemap;
}
