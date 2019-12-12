import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import TestApp from "/tests/util/TestApp.js";

jest.setTimeout(300000);

let primaryShopIdQuery;
let shopId;
let testApp;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  shopId = await testApp.insertPrimaryShop();

  primaryShopIdQuery = testApp.query(`query {
  primaryShopId
}`);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  testApp.stop();
});

test("get primaryShopId, no auth necessary", async () => {
  const result = await primaryShopIdQuery();
  expect(result).toEqual({
    primaryShopId: encodeOpaqueId("reaction/shop", shopId)
  });
});
