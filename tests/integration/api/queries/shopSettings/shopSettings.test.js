import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const ShopSettingsQuery = importAsString("./ShopSettingsQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let shopSettings;

const mockShopSettings = {
  shopId: internalShopId,
  sitemapRefreshPeriod: "every 24 hours"
};

const mockCustomerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["shop-managers"]
  },
  shopId: internalShopId
});


beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.AppSettings.insertOne(mockShopSettings);
  await testApp.createUserAndAccount(mockCustomerAccount);
  shopSettings = testApp.query(ShopSettingsQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.AppSettings.deleteMany({});
  await testApp.stop();
});

test("a shop manager can view shop settigs", async () => {
  let result;
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    result = await shopSettings({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.shopSettings.sitemapRefreshPeriod).toEqual("every 24 hours");
});
