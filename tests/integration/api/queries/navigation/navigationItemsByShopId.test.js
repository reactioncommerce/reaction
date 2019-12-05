import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const navigationItemsQuery = importAsString("./navigationItemsByShopIdQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const navigationItemDocuments = [];

for (let index = 100; index < 123; index += 1) {
  const doc = {
    _id: `navigationItem-${index}`,
    shopId: internalShopId,
    data: {
      content: [
        {
          language: "en",
          value: "Camperos"
        }
      ],
      url: `/tag/item-${index}`,
      isUrlRelative: true,
      shouldOpenInNewWindow: false
    },
    draftData: {
      content: [
        {
          language: "en",
          value: "Camperos"
        }
      ],
      url: `/tag/item-${index}`,
      isUrlRelative: true,
      shouldOpenInNewWindow: false
    },
    metadata: {
      tagId: "68umfiY5xWMR86a26"
    },
    treeIds: [
      "R2rQ2DroFwjsAT2oW"
    ],
    createdAt: new Date(),
    hasUnpublishedChanges: false
  };

  navigationItemDocuments.push(doc);
}

const mockCustomerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: []
  },
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["admin", "core"]
  },
  shopId: internalShopId
});

let testApp;
let navigationItems;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await Promise.all(navigationItemDocuments.map((doc) => (
    testApp.collections.NavigationItems.insertOne(doc)
  )));

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  navigationItems = testApp.query(navigationItemsQuery);
});

afterAll(async () => {
  await testApp.collections.NavigationItems.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("throws access-denied when getting NavigationItems if user is not an admin with core permissions", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await navigationItems({
      shopId: opaqueShopId
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("returns NavigationItems records if user is an admin with core permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await navigationItems({
    shopId: opaqueShopId,
    first: 5,
    sortBy: "_id",
    sortOrder: "asc"
  });

  expect(result.navigationItemsByShopId.nodes.length).toEqual(5);
  expect(result.navigationItemsByShopId.nodes[0]._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-100"));
  expect(result.navigationItemsByShopId.nodes[4]._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-104"));
});


test("returns NavigationItems records on second page if user is an admin with core permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await navigationItems({
    shopId: opaqueShopId,
    first: 5,
    offset: 5,
    sortBy: "_id",
    sortOrder: "asc"
  });
  expect(result.navigationItemsByShopId.nodes.length).toEqual(5);
  expect(result.navigationItemsByShopId.nodes[0]._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-105"));
  expect(result.navigationItemsByShopId.nodes[4]._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-109"));
});
