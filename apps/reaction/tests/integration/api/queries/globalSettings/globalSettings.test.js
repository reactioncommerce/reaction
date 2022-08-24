import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

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
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  testApp.registerPlugin({
    name: "testGlobalSetting",
    graphQL: {
      schemas: [TestGlobalSettingSchema]
    }
  });
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
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
