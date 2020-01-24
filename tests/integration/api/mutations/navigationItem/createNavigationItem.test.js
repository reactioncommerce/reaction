import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateNavigationItemMutation = importAsString("./CreateNavigationItemMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["reaction:legacy:navigationTreeItems/create"]
  }
});

let testApp;
let createNavigationItem;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);

  createNavigationItem = testApp.mutate(CreateNavigationItemMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("an unauthorized user cannot create a navigation item", async () => {
  try {
    await createNavigationItem({
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
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("an authorized user can create a navigation item", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);
  let result;

  try {
    result = await createNavigationItem({
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
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.createNavigationItem.navigationItem.draftData).toEqual({
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
});
