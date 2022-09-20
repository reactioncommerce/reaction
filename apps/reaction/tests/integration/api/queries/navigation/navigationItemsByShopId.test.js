import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

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

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:navigationTreeItems/read"],
  slug: "admin",
  shopId: internalShopId
});

const customerGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["customer"],
  slug: "customer",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

const mockCustomerAccount = Factory.Account.makeOne({
  groups: [customerGroup._id],
  shopId: internalShopId
});

let testApp;
let navigationItems;

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

  await Promise.all(navigationItemDocuments.map((doc) => (
    testApp.collections.NavigationItems.insertOne(doc)
  )));

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  navigationItems = testApp.query(navigationItemsQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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
