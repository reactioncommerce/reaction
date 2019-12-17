import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const SurchargeByIdQuery = importAsString("./SurchargeByIdQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalSurchargeId = "456";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const opaqueSurchargeId = encodeOpaqueId("reaction/surcharge", internalSurchargeId); // reaction/surcharge:456
const shopName = "Test Shop";
let testApp;
let surchargeById;

const mockSurcharge = Factory.Surcharge.makeOne({
  _id: internalSurchargeId,
  shopId: internalShopId,
  amount: 20
});

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Surcharges.insertOne(mockSurcharge);
  surchargeById = testApp.query(SurchargeByIdQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Surcharges.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("retrieve a surcharge by its id", async () => {
  let result;

  try {
    result = await surchargeById({
      shopId: opaqueShopId,
      surchargeId: opaqueSurchargeId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.surchargeById.amount.amount).toEqual(20);
});
