import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";
import Factory from "/tests/util/factory.js";

const CreateShopMutation = importAsString("./CreateShopMutation.graphql");

jest.setTimeout(300000);

let testApp;
let createShop;
const shopId = null;// shop ID is null for account manager and system manager groups. Only these groups can create shop
let mockAdminAccount;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:shops/create"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockAdminAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId: "123"
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  createShop = testApp.mutate(CreateShopMutation);

  await testApp.setLoggedInUser(mockAdminAccount);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("user with `reaction:legacy:shops/create` permission can create shop with name", async () => {
  const mockShopSettings = {
    name: "My Awesome Shop",
    description: "A very awesome shop"
  };

  let result;
  try {
    result = await createShop({
      input: {
        ...mockShopSettings
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const expectedShopSettings = {
    name: "My Awesome Shop",
    shopType: "primary",
    description: "A very awesome shop",
    timezone: "US/Pacific",
    language: "en",
    currency: {
      code: "USD"
    }
  };
  expect(result.createShop.shop).toEqual(expectedShopSettings);
});

test("user with `reaction:legacy:shops/create` permission cannot create 2nd primary shop type", async () => {
  const mockShopSettings = {
    name: "Primary shop",
    type: "primary"
  };

  try {
    await createShop({
      input: {
        ...mockShopSettings
      }
    });
  } catch (error) {
    expect(error).toBeDefined();
    expect(error[0].message).toBe("There may be only one primary shop");
    return;
  }
});

test("user with `reaction:legacy:shops/create` permission can create multiple merchant shop", async () => {
  let result;
  const mockShopSettings1 = {
    name: "Merchant shop 1",
    type: "merchant"
  };
  const mockShopSettings2 = {
    name: "Merchant shop 2",
    type: "merchant",
    defaultTimezone: "US/Eastern",
    defaultLanguage: "es"
  };

  // create 1st merchant shop
  try {
    result = await createShop({
      input: {
        ...mockShopSettings1
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const expectedShopSettings1 = {
    name: "Merchant shop 1",
    description: null,
    shopType: "merchant",
    timezone: "US/Pacific",
    language: "en",
    currency: {
      code: "USD"
    }
  };
  expect(result.createShop.shop).toEqual(expectedShopSettings1);

  // create 2nd merchant shop
  try {
    result = await createShop({
      input: {
        ...mockShopSettings2
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const expectedShopSettings2 = {
    name: "Merchant shop 2",
    description: null,
    shopType: "merchant",
    timezone: "US/Eastern",
    language: "es",
    currency: {
      code: "USD"
    }
  };
  expect(result.createShop.shop).toEqual(expectedShopSettings2);
});
