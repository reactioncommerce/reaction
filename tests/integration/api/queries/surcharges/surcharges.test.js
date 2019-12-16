import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const SurchargesQuery = importAsString("./SurchargesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let surcharges;
let mockSurcharges;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  mockSurcharges = Factory.Surcharge.makeMany(3, {
    shopId: internalShopId,
    amount: 10
  });
  await testApp.collections.Surcharges.insertMany(mockSurcharges);
  surcharges = testApp.query(SurchargesQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Surcharges.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("retrieve a list of surcharges", async () => {
  let result;

  try {
    result = await surcharges({
      shopId: opaqueShopId,
      first: 3
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.surcharges.nodes[0].amount.amount).toEqual(10);
  expect(result.surcharges.nodes.length).toEqual(3);
});
