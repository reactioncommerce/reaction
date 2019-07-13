import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import TestApp from "/imports/test-utils/helpers/TestApp";

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

afterAll(() => testApp.stop());

test("get primaryShopId, no auth necessary", async () => {
  const result = await primaryShopIdQuery();
  expect(result).toEqual({
    primaryShopId: encodeShopOpaqueId(shopId)
  });
});
