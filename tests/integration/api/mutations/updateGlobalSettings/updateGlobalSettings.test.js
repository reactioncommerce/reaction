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
  shopId,
  canSellDigitalProducts: false
};

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [shopId]: ["admin"]
  },
  shopId
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

test("global settings can be updated", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

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

  console.log(JSON.stringify(result));
  expect(result.globalSettings.canSellDigitalProducts).toEqual(true);
});
