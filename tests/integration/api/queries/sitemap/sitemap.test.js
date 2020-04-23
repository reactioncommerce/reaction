import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const SitemapQuery = importAsString("./SitemapQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const shopName = "Test Shop";
const handle = "sitemap.xml";
const shopUrl = "http://localhost";
let testApp;
let sitemap;

const mockSitemap = Factory.Sitemap.makeOne({
  _id: "456",
  shopId: internalShopId,
  xml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n    <sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n      <sitemap>\n        <loc>http://localhost/sitemap-pages-1.xml</loc>\n        <lastmod>2019-12-6</lastmod>\n      </sitemap>\n      <sitemap>\n        <loc>http://localhost/sitemap-tags-1.xml</loc>\n        <lastmod>2018-9-21</lastmod>\n      </sitemap>\n      <sitemap>\n        <loc>http://localhost/sitemap-products-1.xml</loc>\n        <lastmod>2019-9-18</lastmod>\n      </sitemap>\n</sitemapindex>",
  handle
});

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, domains: ["localhost"], name: shopName });
  await testApp.collections.Sitemaps.insertOne(mockSitemap);
  sitemap = testApp.query(SitemapQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("returns a sitemap given a handle/name and shopUrl", async () => {
  let result;
  try {
    result = await sitemap({
      handle,
      shopUrl
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.sitemap.xml).toEqual(mockSitemap.xml);
});
