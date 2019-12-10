import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const SitemapQuery = importAsString("./SitemapQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const shopName = "Test Shop";
const handle = "sitemap.xml";
const shopUrl = "http://localhost";
let testApp;
let sitemap;

const mockSitemap = {
  _id: "456",
  shopId: internalShopId,
  xml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n    <sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n      <sitemap>\n        <loc>http://localhost/sitemap-pages-1.xml</loc>\n        <lastmod>2019-12-6</lastmod>\n      </sitemap>\n      <sitemap>\n        <loc>http://localhost/sitemap-tags-1.xml</loc>\n        <lastmod>2018-9-21</lastmod>\n      </sitemap>\n      <sitemap>\n        <loc>http://localhost/sitemap-products-1.xml</loc>\n        <lastmod>2019-9-18</lastmod>\n      </sitemap>\n</sitemapindex>",
  handle
};

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, domains: ["localhost"], name: shopName });
  await testApp.collections.Sitemaps.insertOne(mockSitemap);
  sitemap = testApp.query(SitemapQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Sitemaps.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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
