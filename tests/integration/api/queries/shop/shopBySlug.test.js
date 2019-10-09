import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import TestApp from "/imports/test-utils/helpers/TestApp";

jest.setTimeout(300000);

let shopBySlagQuery;
let shopId;
let testApp;
const shopSlug = "integ-test-shop-slug";

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop({ slug: shopSlug });
  shopBySlagQuery = testApp.query(`query ($slug: String!) {
    shopBySlug(slug: $slug) {
      _id
      name
    }
  }`);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("get shop, no auth necessary", async () => {
  const opaqueShopId = encodeShopOpaqueId(shopId);
  const result = await shopBySlagQuery({ slug: shopSlug });
  expect(result.shopBySlug.name).toBe("Primary Shop");
  expect(result.shopBySlug._id).toBe(opaqueShopId);
});
