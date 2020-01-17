import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const GlobalSettingsQuery = importAsString("./GlobalSettingsQuery.graphql");
const TestGlobalSettingSchema = `
  extend type GlobalSettings {
    canSellVariantWithoutInventory: Boolean
  }
`;

jest.setTimeout(300000);

const internalShopId = "123";
const shopName = "Test Shop";
let testApp;
let globalSettings;

const mockGlobalSetting = {
  canSellVariantWithoutInventory: true
};

beforeAll(async () => {
  testApp = new TestApp();
  testApp.registerPlugin({
    name: "testGlobalSetting",
    graphQL: {
      schemas: [TestGlobalSettingSchema]
    }
  });
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.AppSettings.insertOne(mockGlobalSetting);
  globalSettings = testApp.query(GlobalSettingsQuery);
});

afterAll(async () => {
  await testApp.collections.AppSettings.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("view global app settings", async () => {
  let result;
  try {
    result = await globalSettings();
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.globalSettings.canSellVariantWithoutInventory).toEqual(true);
});
