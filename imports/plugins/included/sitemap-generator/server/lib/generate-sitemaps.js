import { Meteor } from "meteor/meteor";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Notifications, Products, Shops, Tags } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Sitemaps } from "../../lib/collections/sitemaps";

const DEFAULT_URLS_PER_SITEMAP = 1000;

/**
 * @name generateSitemaps
 * @summary Generates & stores sitemap documents for one or more shops, without Meteor method context
 * @param {Object} options - Options
 * @param {Array} [options.shopIds] - _id of shops to generate sitemaps for. Defaults to primary shop _id
 * @param {String} [options.notifyUserId] - Optional user _id to notify via notifications UI
 * @param {Number} [options.urlsPerSitemap] - Max # of URLs per sitemap
 * @returns {undefined}
 */
export default function generateSitemaps({ shopIds = [], notifyUserId = "", urlsPerSitemap = DEFAULT_URLS_PER_SITEMAP }) {
  Logger.debug("Generating sitemaps");
  const timeStart = new Date();

  // Add primary shop _id if none provided
  if (shopIds.length === 0) {
    shopIds.push(Reaction.getPrimaryShopId());
  }

  // Generate sitemaps for each shop
  shopIds.forEach((shopId) => {
    generateSitemapsForShop(shopId, urlsPerSitemap);
  });

  // Notify user, if manually generated
  if (notifyUserId) {
    Notifications.insert({
      to: notifyUserId,
      type: "sitemapGenerated",
      message: "Sitemap refresh is complete",
      hasDetails: false,
      url: "/sitemap.xml"
    });
  }

  const timeEnd = new Date();
  const timeDiff = timeEnd.getTime() - timeStart.getTime();
  Logger.debug(`Sitemap generation complete. Took ${timeDiff}ms`);
}

/**
 * @name generateSitemapsForShop
 * @private
 * @summary Creates and stores the sitemaps for a single shop, if any need to be regenerated,
 * meaning a product/tag has been updated, or a new custom URL is provided via the onGenerateSitemap hook
 * @param {String} shopId - _id of shop to generate sitemaps for
 * @param {Number} urlsPerSitemap - Max # of URLs per sitemap
 * @returns {undefined}
 */
function generateSitemapsForShop(shopId, urlsPerSitemap) {
  const shop = Shops.findOne({ _id: shopId }, { fields: { _id: 1 } });
  if (!shop) {
    throw new Meteor.Error("not-found", `Shop ${shopId} not found`);
  }

  const sitemapIndex = Sitemaps.findOne({ shopId, handle: "sitemap.xml" });
  const hasNoSitemap = typeof sitemapIndex === "undefined";
  const sitemapIndexItems = [];

  // Generate sitemaps for basic pages
  // Allow custom shops to add arbitrary URLs to the sitemap
  const pageSitemapItems = Hooks.Events.run("onGenerateSitemap", [
    {
      url: "BASE_URL",
      lastModDate: new Date() // Always assume homepage has updated each time generation runs
    }
  ]);
  const pageSitemaps = rebuildPaginatedSitemaps(shopId, {
    typeHandle: "pages",
    items: pageSitemapItems,
    urlsPerSitemap
  });
  sitemapIndexItems.push(...pageSitemaps);

  // Regenerate tag sitemaps, if a tag has been created or updated since last generation
  const selector = { updatedAt: { $gt: sitemapIndex && sitemapIndex.createdAt } };
  const options = { fields: { _id: 1 } };
  const shouldRegenTagSitemaps = hasNoSitemap || !!Tags.findOne(selector, options);
  if (shouldRegenTagSitemaps) {
    const tagSitemapItems = getTagSitemapItems(shopId);
    const tagSitemaps = rebuildPaginatedSitemaps(shopId, {
      typeHandle: "tags",
      items: tagSitemapItems,
      urlsPerSitemap
    });
    sitemapIndexItems.push(...tagSitemaps);
  } else {
    // Load existing tag sitemaps for index
    sitemapIndexItems.push(...getExistingSitemapsForIndex(shopId, "tags"));
  }

  // Do the same for products
  const shouldRegenProductSitemaps = hasNoSitemap || !!Products.findOne(selector, options);
  if (shouldRegenProductSitemaps) {
    const productSitemapItems = getProductSitemapItems(shopId);
    const productSitemaps = rebuildPaginatedSitemaps(shopId, {
      typeHandle: "products",
      items: productSitemapItems,
      urlsPerSitemap
    });
    sitemapIndexItems.push(...productSitemaps);
  } else {
    sitemapIndexItems.push(...getExistingSitemapsForIndex(shopId, "products"));
  }

  // Regenerate sitemap index
  Sitemaps.remove({ shopId, handle: "sitemap.xml" });
  Sitemaps.insert({
    shopId,
    xml: generateIndexXML(sitemapIndexItems),
    handle: "sitemap.xml",
    createdAt: new Date()
  });
}

/**
 * @name rebuildPaginatedSitemaps
 * @summary Deletes old sitemaps for type, builds new paginated sitemaps, saves to collection, and returns items to add
 *  to sitemap index
 * @private
 * @param {String} shopId - _id of shop sitemaps are for
 * @param {Object} options - Options
 * @param {String} options.typeHandle - type of sitemap, i.e. "pages", "tags", "products"
 * @param {Object[]} options.items - Array of items to add to generated sitemaps
 * @param {String} options.items[].url - URL of page
 * @param {Date} options.items[].lastModDate - Last time page was updated
 * @param {Number} options.urlsPerSitemap - Max # of URLs per sitemap
 * @returns {Object[]} - Array of items to add to sitemap index
 */
function rebuildPaginatedSitemaps(shopId, { typeHandle, items, urlsPerSitemap }) {
  // Remove old sitemaps for type
  Sitemaps.remove({ shopId, handle: { $regex: new RegExp(`^sitemap-${typeHandle}`) } });

  const sitemapIndexItems = [];

  for (let currentPage = 1; currentPage <= Math.ceil(items.length / urlsPerSitemap); currentPage += 1) {
    const startIndex = (currentPage - 1) * urlsPerSitemap;
    const endIndex = startIndex + urlsPerSitemap;
    const sitemapPageItems = items.slice(startIndex, endIndex);

    Sitemaps.insert({
      shopId,
      xml: generateSitemapXML(sitemapPageItems),
      handle: `sitemap-${typeHandle}-${currentPage}.xml`,
      createdAt: new Date()
    });

    sitemapIndexItems.push({
      url: `BASE_URL/sitemap-${typeHandle}-${currentPage}.xml`,
      lastModDate: new Date()
    });
  }

  return sitemapIndexItems;
}

/**
 * @name getTagSitemapItems
 * @private
 * @summary Loads visible tags and returns an array of items to add to the tags sitemap
 * @param {String} shopId - _id of shop to load tags from
 * @returns {Object[]} - Array of objects w/ url & lastModDate properties
 */
function getTagSitemapItems(shopId) {
  return Tags.find({
    shopId,
    isVisible: true,
    isDeleted: false
  }, { fields: { slug: 1, updatedAt: 1 } }).map((tag) => {
    const { slug, updatedAt } = tag;
    return {
      url: `BASE_URL/tag/${slug}`,
      lastModDate: updatedAt
    };
  });
}

/**
 * @name getProductSitemapItems
 * @private
 * @summary Loads visible products and returns an array of items to add to the products sitemap
 * @param {String} shopId - _id of shop to load products from
 * @returns {Object[]} - Array of objects w/ url & lastModDate properties
 */
function getProductSitemapItems(shopId) {
  return Products.find({
    shopId,
    type: "simple",
    isVisible: true,
    isDeleted: false,
    shouldAppearInSitemap: true
  }, { fields: { handle: 1, updatedAt: 1 } }).map((product) => {
    const { handle, updatedAt } = product;
    return {
      url: `BASE_URL/product/${handle}`,
      lastModDate: updatedAt
    };
  });
}

/**
 * @name getExistingSitemapsForIndex
 * @private
 * @summary Loads existing sitemaps by type and returns an array of items for the sitemap index
 * @param {String} shopId - _id of shop sitemaps are for
 * @param {String} typeHandle - type of sitemaps to load, i.e. "products", "pages", or "tags"
 * @returns {Object[]} - Array of objects w/ url & lastModDate properties
 */
function getExistingSitemapsForIndex(shopId, typeHandle) {
  return Sitemaps.find({
    shopId,
    handle: { $regex: new RegExp(`^sitemap-${typeHandle}`) }
  }, { fields: { handle: 1, createdAt: 1 } }).map((sitemap) => {
    const { handle, createdAt } = sitemap;
    return {
      url: `BASE_URL/${handle}`,
      lastModDate: createdAt
    };
  });
}

/**
 * @name generateIndexXML
 * @summary Generates & returns XML for a sitemap index (doc that points to sitemaps)
 * @private
 * @param {Object[]} items - Array of items to add to sitemap index
 * @param {String} items[].url - URL of page
 * @param {Date} items[].lastModDate - Last time sitemap was updated
 * @returns {String} - Generated XML
 */
function generateIndexXML(items) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  items.forEach((item) => {
    const { url, lastModDate } = item;
    const lastMod = getLastModStr(lastModDate);
    xml += `
      <sitemap>
        <loc>URL</loc>
        <lastmod>LAST_MOD</lastmod>
      </sitemap>`
      .replace("URL", url)
      .replace("LAST_MOD", lastMod);
  });

  xml += "\n</sitemapindex>";

  return xml;
}

/**
 * @name getLastModStr
 * @private
 * @summary Given a date, returns a formatted date string
 * @param {Date} date - Date to format
 * @returns {String} - in the format of YYYY-MM-DD
 */
function getLastModStr(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * @name generateSitemapXML
 * @summary Generates & returns XML for a sitemap document
 * @private
 * @param {Object[]} items - Array of items to add to sitemap
 * @param {String} items[].url - URL of page
 * @param {Date} items[].lastModDate - Last time page was updated
 * @returns {String} - Generated XML
 */
function generateSitemapXML(items) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  items.forEach((item) => {
    const { url, lastModDate } = item;
    const lastMod = getLastModStr(lastModDate);
    xml += `
      <url>
        <loc>URL</loc>
        <lastmod>LAST_MOD</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`
      .replace("URL", url)
      .replace("LAST_MOD", lastMod);
  });

  xml += "\n</urlset>";

  return xml;
}
