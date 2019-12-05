import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const ShopBySlugQuery = importAsString("./ShopBySlugQuery.graphql");

jest.setTimeout(300000);

let shopBySlugQuery;
let shopId;
const shopName = "Slug Integration Test";
let testApp;
let opaqueShopId;
const shopSlug = "integ-test-shop-slug";

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop({ slug: shopSlug, name: shopName });
  opaqueShopId = encodeOpaqueId("reaction/shop", shopId);
  shopBySlugQuery = testApp.query(ShopBySlugQuery);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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
