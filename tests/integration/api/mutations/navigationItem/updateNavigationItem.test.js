import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateNavigationItemMutation = importAsString("./CreateNavigationItemMutation.graphql");
const UpdateNavigationItemMutation = importAsString("./UpdateNavigationItemMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: [
      "reaction:legacy:navigationTreeItems/create",
      "reaction:legacy:navigationTreeItems/delete",
      "reaction:legacy:navigationTreeItems/publish",
      "reaction:legacy:navigationTreeItems/read",
      "reaction:legacy:navigationTreeItems/update"
    ]
  }
});

let testApp;
let createNavigationItem;
let updateNavigationItem;
let createdNavigationItemOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
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

afterAll(async () => {
  await testApp.collections.NavigationItems.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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
