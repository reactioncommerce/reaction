import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const UpdateNavigationTreeMutation = importAsString("./UpdateNavigationTreeMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const encodeNavigationTreeOpaqueId = encodeOpaqueId("reaction/navigationTree");
const encodeNavigationItemOpaqueId = encodeOpaqueId("reaction/navigationItem");

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["reaction:legacy:navigationTrees/update"]
  }
});

const mockNavigationTree = Factory.NavigationTree.makeOne({
  _id: "1001",
  name: "Default Navigation",
  shopId: internalShopId,
  draftItems: Factory.NavigationTreeItem.makeMany(2, {
    isPrivate: false,
    isSecondary: false,
    isVisible: false
  })
});

const mockNavigationItem = Factory.NavigationItem.makeOne({
  shopId: internalShopId
});

const updateNavigationTreeInput = {
  shopId: opaqueShopId,
  navigationTree: {
    name: "Not Default Navigation",
    draftItems: [
      {
        navigationItemId: encodeNavigationItemOpaqueId(mockNavigationItem._id),
        isPrivate: false,
        isSecondary: false,
        isVisible: true
      }
    ]
  },
  id: encodeNavigationTreeOpaqueId(mockNavigationTree._id)
};

let testApp;
let updateNavigationTree;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);
  await testApp.collections.NavigationTrees.insertOne(mockNavigationTree);
  await testApp.collections.NavigationItems.insertOne(mockNavigationItem);

  updateNavigationTree = await testApp.mutate(UpdateNavigationTreeMutation);
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
    result = await updateNavigationTree({
      updateNavigationTreeInput
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.updateNavigationTree.navigationTree).toEqual({
    _id: encodeNavigationTreeOpaqueId(mockNavigationTree._id),
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
    name: "Not Default Navigation",
    shopId: opaqueShopId
  });
});

test("an unauthorized user should not be able to update the navigation tree", async () => {
  try {
    await updateNavigationTree({
      updateNavigationTreeInput
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
