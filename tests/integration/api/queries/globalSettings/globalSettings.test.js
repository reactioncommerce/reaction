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

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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
