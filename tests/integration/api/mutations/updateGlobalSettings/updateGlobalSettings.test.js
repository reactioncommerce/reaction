import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

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

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    __global_roles__: ["admin"] // eslint-disable-line camelcase
  }
});

beforeAll(async () => {
  testApp = new TestApp();

  testApp.registerPlugin({
    name: "testGlobalSetting",
    graphQL: {
      schemas: [TestGlobalSettingSchema]
    },
    globalSettingsConfig: {
      canSellDigitalProducts: {
        rolesThatCanEdit: ["admin"],
        simpleSchema: {
          type: Boolean
        }
      }
    }
  });

  await testApp.start();
  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.collections.AppSettings.insertOne(mockGlobalSetting);
  globalSettingsMutation = testApp.query(updateGlobalSettings);
});

afterAll(async () => {
  await testApp.collections.AppSettings.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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
