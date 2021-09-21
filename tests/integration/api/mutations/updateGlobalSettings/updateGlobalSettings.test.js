import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const updateGlobalSettings = importAsString("./updateGlobalSettings.graphql");
const TestGlobalSettingSchema = `
  extend type GlobalSettings {
    canSellDigitalProducts: Boolean
  }

  extend input GlobalSettingsUpdates {
    canSellDigitalProducts: Boolean
  }

  extend input UpdateGlobalSettingsInput {
    """
    If true a shop can sell digital products
    """
    canSellDigitalProducts: Boolean
  }
`;

jest.setTimeout(300000);

const shopId = "123";
const shopName = "Test Shop";
let testApp;
let globalSettingsMutation;

const mockGlobalSetting = {
  canSellDigitalProducts: false
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shops/update"],
  slug: "admin",
  shopId: null // global permission group
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: ["adminGroup"]
});

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
    },
    globalSettingsConfig: {
      canSellDigitalProducts: {
        permissionsThatCanEdit: ["reaction:legacy:shops/update"],
        simpleSchema: {
          type: Boolean
        }
      }
    }
  });

  await testApp.start();
  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.collections.AppSettings.insertOne(mockGlobalSetting);
  globalSettingsMutation = testApp.query(updateGlobalSettings);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot  update global settings", async () => {
  try {
    await globalSettingsMutation({
      input: {
        settingsUpdates: {
          canSellDigitalProducts: true
        }
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("an admin user can  update global settings", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);
  const settings = await testApp.collections.AppSettings.findOne({
    canSellDigitalProducts: false
  });
  expect(settings.canSellDigitalProducts).toEqual(false);

  try {
    result = await globalSettingsMutation({
      input: {
        settingsUpdates: {
          canSellDigitalProducts: true
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateGlobalSettings.globalSettings.canSellDigitalProducts).toEqual(true);
});
