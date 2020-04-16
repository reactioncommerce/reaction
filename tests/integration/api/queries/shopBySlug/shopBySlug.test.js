import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const ShopBySlugQuery = importAsString("./ShopBySlugQuery.graphql");

jest.setTimeout(300000);

let shopBySlugQuery;
let shopId;
const shopName = "Slug Integration Test";
let testApp;
let opaqueShopId;
const shopSlug = "integ-test-shop-slug";

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context, { slug: shopSlug, name: shopName });
  opaqueShopId = encodeOpaqueId("reaction/shop", shopId);
  shopBySlugQuery = testApp.query(ShopBySlugQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("get shop by slug success", async () => {
  const result = await shopBySlugQuery({ slug: shopSlug });
  expect(result.shopBySlug.name).toBe(shopName);
  expect(result.shopBySlug._id).toBe(opaqueShopId);
});

test("get shop by slug failure", async () => {
  const result = await shopBySlugQuery({ slug: "does-not-exist" });
  expect(result.shopBySlug).toBeNull();
});

test("get invalid params error", async () => {
  try {
    await shopBySlugQuery({});
  } catch (error) {
    expect(error[0].message).toBe("Variable \"$slug\" of required type \"String!\" was not provided.");
  }
});
