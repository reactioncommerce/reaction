import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const updateShopSettings = importAsString("./updateShopSettings.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId);
const shopName = "Test Shop";
let testApp;
let shopSettingsMutation;

const mockAdminAccount = Factory.Account.makeOne({
  _id: "345",
  shopId,
  roles: {
    [shopId]: ["reaction:legacy:shops/update"]
  }
});

const mockShopSetting = {
  shopId,
  canSellVariantWithoutInventory: true
};

beforeAll(async () => {
  testApp = new TestApp();

  await testApp.start();
  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.collections.AppSettings.insertOne(mockShopSetting);
  shopSettingsMutation = testApp.query(updateShopSettings);
});

afterAll(async () => {
  await testApp.collections.AppSettings.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("an anonymous user cannot update shop settings", async () => {
  try {
    await shopSettingsMutation({
      input: {
        shopId: opaqueShopId,
        settingsUpdates: {
          canSellVariantWithoutInventory: false
        }
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("shop settings can be updated by an admin user", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  // Verify setting is true initially.
  const testSetting = await testApp.collections.AppSettings.findOne({ shopId });
  expect(testSetting.canSellVariantWithoutInventory).toEqual(true);

  try {
    result = await shopSettingsMutation({
      input: {
        shopId: opaqueShopId,
        settingsUpdates: {
          canSellVariantWithoutInventory: false
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateShopSettings.shopSettings.canSellVariantWithoutInventory).toEqual(false);
});
