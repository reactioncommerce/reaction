import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const CreateNavigationItemMutation = importAsString("./CreateNavigationItemMutation.graphql");
const UpdateNavigationItemMutation = importAsString("./UpdateNavigationItemMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: [
    "reaction:legacy:navigationTreeItems/create",
    "reaction:legacy:navigationTreeItems/delete",
    "reaction:legacy:navigationTreeItems/publish",
    "reaction:legacy:navigationTreeItems/read",
    "reaction:legacy:navigationTreeItems/update"
  ],
  slug: "admin",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

let testApp;
let createNavigationItem;
let updateNavigationItem;
let createdNavigationItemOpaqueId;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  createNavigationItem = testApp.mutate(CreateNavigationItemMutation);
  updateNavigationItem = testApp.mutate(UpdateNavigationItemMutation);

  const { createNavigationItem: createResult } = await createNavigationItem({
    createNavigationItemInput: {
      navigationItem: {
        shopId: opaqueShopId,
        draftData: {
          classNames: "red-tag",
          content: [{
            language: "en",
            value: "Shirts"
          }],
          isUrlRelative: true,
          shouldOpenInNewWindow: false,
          url: "/tag/shirts"
        }
      }
    }
  });

  createdNavigationItemOpaqueId = createResult.navigationItem._id;
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an unauthorized user cannot update a navigation item", async () => {
  try {
    await updateNavigationItem({
      updateNavigationItemInput: {
        id: createdNavigationItemOpaqueId,
        shopId: opaqueShopId,
        navigationItem: {
          shopId: opaqueShopId,
          draftData: {
            classNames: "blue-tag",
            content: [{
              language: "en",
              value: "Blue Shirts"
            }],
            isUrlRelative: true,
            shouldOpenInNewWindow: false,
            url: "/tag/blue-shirts"
          }
        }
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("an authorized can update a navigation item as an admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);
  let result;


  try {
    result = await updateNavigationItem({
      updateNavigationItemInput: {
        id: createdNavigationItemOpaqueId,
        shopId: opaqueShopId,
        navigationItem: {
          shopId: opaqueShopId,
          draftData: {
            classNames: "blue-tag",
            content: [{
              language: "en",
              value: "Blue Shirts"
            }],
            isUrlRelative: true,
            shouldOpenInNewWindow: false,
            url: "/tag/blue-shirts"
          }
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.updateNavigationItem.navigationItem.draftData).toEqual({
    classNames: "blue-tag",
    content: [{
      language: "en",
      value: "Blue Shirts"
    }],
    contentForLanguage: null,
    isUrlRelative: true,
    shouldOpenInNewWindow: false,
    url: "/tag/blue-shirts"
  });
});
