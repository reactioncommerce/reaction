import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

const DEFAULT_URLS_PER_SITEMAP = 1000;

/**
 * @name SitemapsSchema
 * @memberof Schemas
 * @summary Schema for Sitemaps collection
 * @type {SimpleSchema}
 */
export const SitemapsSchema = new SimpleSchema({
  shopId: String,
  handle: String,
  xml: String,
  createdAt: Date
});

/**
 * @name generateSitemaps
 * @summary Generates & stores sitemap documents for one or more shops
 * @param {Object} context App context
 * @param {Object} options - Options
 * @param {Array} [options.shopIds] - _id of shops to generate sitemaps for. Defaults to primary shop _id
 * @param {String} [options.notifyUserId] - Optional user _id to notify via notifications UI
 * @param {Number} [options.urlsPerSitemap] - Max # of URLs per sitemap
 * @returns {undefined}
 */
export default async function generateSitemaps(context, { shopIds = [], notifyUserId = "", urlsPerSitemap = DEFAULT_URLS_PER_SITEMAP }) {
  Logger.debug("Generating sitemaps");
  const timeStart = new Date();

  // Add primary shop _id if none provided
  if (shopIds.length === 0) {
    throw new Error("generateSitemaps requires shopIds list");
  }

  // Generate sitemaps for each shop
  await Promise.all(shopIds.map((shopId) => generateSitemapsForShop(context, shopId, urlsPerSitemap)));

  // Notify user, if manually generated
  if (notifyUserId) {
    await context.mutations.createNotification(context, {
      accountId: notifyUserId,
      type: "sitemapGenerated",
      message: "Sitemap refresh is complete",
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
 * @param {Object} context App context
 * @param {String} shopId - _id of shop to generate sitemaps for
 * @param {Number} urlsPerSitemap - Max # of URLs per sitemap
 * @returns {undefined}
 */
async function generateSitemapsForShop(context, shopId, urlsPerSitemap) {
  const { collections: { Products, Shops, Sitemaps, Tags } } = context;

  const shop = await Shops.findOne({ _id: shopId }, { projection: { _id: 1 } });
  if (!shop) {
    throw new ReactionError("not-found", `Shop ${shopId} not found`);
  }

  const sitemapIndex = await Sitemaps.findOne({ shopId, handle: "sitemap.xml" });
  const hasNoSitemap = typeof sitemapIndex === "undefined";
  const sitemapIndexItems = [];

  // Generate sitemaps for basic pages
  // Allow custom shops to add arbitrary URLs to the sitemap
  const customFuncs = context.getFunctionsOfType("getPageSitemapItems");
  const customPageItemResults = await Promise.all(customFuncs.map((customFunc) => customFunc()));
  const pageSitemapItems = customPageItemResults.reduce((list, customItems) => list.concat(customItems), [
    {
      url: "BASE_URL",
      lastModDate: new Date() // Always assume homepage has updated each time generation runs
    }
  ]);

  const pageSitemaps = await rebuildPaginatedSitemaps(context, shopId, {
    typeHandle: "pages",
    items: pageSitemapItems,
    urlsPerSitemap
  });
  sitemapIndexItems.push(...pageSitemaps);

  // Regenerate tag sitemaps, if a tag has been created or updated since last generation
  const selector = { updatedAt: { $gt: sitemapIndex && sitemapIndex.createdAt } };
  const options = { projection: { _id: 1 } };
  const shouldRegenTagSitemaps = hasNoSitemap || !!(await Tags.findOne(selector, options));
  if (shouldRegenTagSitemaps) {
    const tagSitemapItems = await getTagSitemapItems(shopId);
    const tagSitemaps = await rebuildPaginatedSitemaps(context, shopId, {
      typeHandle: "tags",
      items: tagSitemapItems,
      urlsPerSitemap
    });
    sitemapIndexItems.push(...tagSitemaps);
  } else {
    // Load existing tag sitemaps for index
    sitemapIndexItems.push(...await getExistingSitemapsForIndex(context, shopId, "tags"));
  }

  // Do the same for products
  const shouldRegenProductSitemaps = hasNoSitemap || !!(await Products.findOne(selector, options));
  if (shouldRegenProductSitemaps) {
    const productSitemapItems = await getProductSitemapItems(context, shopId);
    const productSitemaps = await rebuildPaginatedSitemaps(context, shopId, {
      typeHandle: "products",
      items: productSitemapItems,
      urlsPerSitemap
    });
    sitemapIndexItems.push(...productSitemaps);
  } else {
    sitemapIndexItems.push(...await getExistingSitemapsForIndex(context, shopId, "products"));
  }

  // Regenerate sitemap index
  const newDoc = {
    shopId,
    xml: generateIndexXML(sitemapIndexItems),
    handle: "sitemap.xml",
    createdAt: new Date()
  };

  SitemapsSchema.validate(newDoc);

  await Sitemaps.replaceOne({ shopId, handle: "sitemap.xml" }, newDoc, { upsert: true });
}

/**
 * @name rebuildPaginatedSitemaps
 * @summary Deletes old sitemaps for type, builds new paginated sitemaps, saves to collection, and returns items to add
 *  to sitemap index
 * @private
 * @param {Object} context App context
 * @param {String} shopId - _id of shop sitemaps are for
 * @param {Object} options - Options
 * @param {String} options.typeHandle - type of sitemap, i.e. "pages", "tags", "products"
 * @param {Object[]} options.items - Array of items to add to generated sitemaps
 * @param {String} options.items[].url - URL of page
 * @param {Date} options.items[].lastModDate - Last time page was updated
 * @param {Number} options.urlsPerSitemap - Max # of URLs per sitemap
 * @returns {Object[]} - Array of items to add to sitemap index
 */
async function rebuildPaginatedSitemaps(context, shopId, { typeHandle, items, urlsPerSitemap }) {
  const { collections: { Sitemaps } } = context;

  // Remove old sitemaps for type
  await Sitemaps.deleteMany({ shopId, handle: { $regex: new RegExp(`^sitemap-${typeHandle}`) } });

  const sitemapIndexItems = [];

  for (let currentPage = 1; currentPage <= Math.ceil(items.length / urlsPerSitemap); currentPage += 1) {
    const startIndex = (currentPage - 1) * urlsPerSitemap;
    const endIndex = startIndex + urlsPerSitemap;
    const sitemapPageItems = items.slice(startIndex, endIndex);

    const newDoc = {
      shopId,
      xml: generateSitemapXML(sitemapPageItems),
      handle: `sitemap-${typeHandle}-${currentPage}.xml`,
      createdAt: new Date()
    };

    SitemapsSchema.validate(newDoc);

    // eslint-disable-next-line no-await-in-loop
    await Sitemaps.insertOne(newDoc);

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
 * @param {Object} context App context
 * @param {String} shopId - _id of shop to load tags from
 * @returns {Object[]} - Array of objects w/ url & lastModDate properties
 */
async function getTagSitemapItems(context, shopId) {
  const { collections: { Tags } } = context;

  const tags = await Tags.find({
    shopId,
    isVisible: true,
    isDeleted: false
  }, { projection: { slug: 1, updatedAt: 1 } }).toArray();

  return tags.map((tag) => {
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
 * @param {Object} context App context
 * @param {String} shopId - _id of shop to load products from
 * @returns {Object[]} - Array of objects w/ url & lastModDate properties
 */
async function getProductSitemapItems(context, shopId) {
  const { collections: { Products } } = context;

  const products = await Products.find({
    shopId,
    type: "simple",
    isVisible: true,
    isDeleted: false,
    shouldAppearInSitemap: true
  }, { projection: { handle: 1, updatedAt: 1 } }).toArray();

  return products.map((product) => {
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
 * @param {Object} context App context
 * @param {String} shopId - _id of shop sitemaps are for
 * @param {String} typeHandle - type of sitemaps to load, i.e. "products", "pages", or "tags"
 * @returns {Object[]} - Array of objects w/ url & lastModDate properties
 */
async function getExistingSitemapsForIndex(context, shopId, typeHandle) {
  const { collections: { Sitemaps } } = context;

  const sitemaps = await Sitemaps.find({
    shopId,
    handle: { $regex: new RegExp(`^sitemap-${typeHandle}`) }
  }, { projection: { handle: 1, createdAt: 1 } }).toArray();

  return sitemaps.map((sitemap) => {
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
