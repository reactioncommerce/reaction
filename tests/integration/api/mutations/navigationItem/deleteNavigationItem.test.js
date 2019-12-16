import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateNavigationItemMutation = importAsString("./CreateNavigationItemMutation.graphql");
const DeleteNavigationItemMutation = importAsString("./DeleteNavigationItemMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["admin", "core"]
  }
});

let testApp;
let createNavigationItem;
let deleteNavigationItem;
let createdNavigationItemOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  createNavigationItem = testApp.mutate(CreateNavigationItemMutation);
  deleteNavigationItem = testApp.mutate(DeleteNavigationItemMutation);

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

afterAll(async () => {
  await testApp.collections.NavigationItems.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("an unauthorized user cannot delete a navigation item", async () => {
  try {
    await deleteNavigationItem({
      id: createdNavigationItemOpaqueId,
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("an authorized user can delete a navigation item", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);
  let result;

  try {
    result = await deleteNavigationItem({
      id: createdNavigationItemOpaqueId,
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.deleteNavigationItem.navigationItem.draftData).toEqual({
    classNames: "red-tag",
    content: [{
      language: "en",
      value: "Shirts"
    }],
    contentForLanguage: null,
    isUrlRelative: true,
    shouldOpenInNewWindow: false,
    url: "/tag/shirts"
  });

  // Ensure the item was deleted from the database
  const deletedNavigationItemDatabaseId = decodeOpaqueIdForNamespace("reaction/navigationItem")(result.deleteNavigationItem.navigationItem._id);

  const deletedDocument = await testApp.collections.NavigationItems.findOne({
    _id: deletedNavigationItemDatabaseId,
    shopId: internalShopId
  });

  expect(deletedDocument).toBeNull();
});

