import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateNavigationTreeMutation = importAsString("./CreateNavigationTreeMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const encodeNavigationItemOpaqueId = encodeOpaqueId("reaction/navigationItem");

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["admin", "core"]
  }
});

const mockNavigationItem = Factory.NavigationItem.makeOne({
  shopId: internalShopId
});

const createNavigationTreeInput = {
  shopId: opaqueShopId,
  navigationTree: {
    name: "Main Navigation",
    draftItems: [
      {
        navigationItemId: encodeNavigationItemOpaqueId(mockNavigationItem._id),
        isPrivate: false,
        isSecondary: false,
        isVisible: true
      }
    ]
  }
};

let testApp;
let createNavigationTree;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);
  await testApp.collections.NavigationItems.insertOne(mockNavigationItem);


  createNavigationTree = await testApp.mutate(CreateNavigationTreeMutation);
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

afterAll(async () => {
  await testApp.collections.NavigationItems.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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
