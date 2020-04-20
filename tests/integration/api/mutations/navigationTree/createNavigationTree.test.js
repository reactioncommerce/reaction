import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const CreateNavigationTreeMutation = importAsString("./CreateNavigationTreeMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const encodeNavigationItemOpaqueId = encodeOpaqueId("reaction/navigationItem");

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:navigationTrees/create"],
  slug: "admin",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

const mockNavigationItem = Factory.NavigationItem.makeOne({
  shopId: internalShopId
});

const createNavigationTreeInput = {
  shopId: opaqueShopId,
  name: "Main Navigation",
  draftItems: [
    {
      navigationItemId: encodeNavigationItemOpaqueId(mockNavigationItem._id),
      isPrivate: false,
      isSecondary: false,
      isVisible: true
    }
  ]
};

let testApp;
let createNavigationTree;

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
  await testApp.collections.NavigationItems.insertOne(mockNavigationItem);


  createNavigationTree = await testApp.mutate(CreateNavigationTreeMutation);
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an authorized user should be able to update the navigation tree", async () => {
  let result;
  try {
    await testApp.setLoggedInUser(mockAdminAccount);
    result = await createNavigationTree({
      createNavigationTreeInput
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.createNavigationTree.navigationTree).toEqual({
    draftItems: [
      {
        expanded: null,
        isPrivate: false,
        isSecondary: false,
        isVisible: true,
        navigationItem: {
          _id: encodeNavigationItemOpaqueId(mockNavigationItem._id)
        }
      }
    ],
    hasUnpublishedChanges: true,
    name: "Main Navigation",
    shopId: opaqueShopId
  });
});

test("an unauthorized user should not be able to update the navigation tree", async () => {
  try {
    await createNavigationTree({
      createNavigationTreeInput
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
