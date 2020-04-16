import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const navigationTreeQuery = importAsString("./navigationTreeByIdQuery.graphql");

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
          value: "Shoes"
        },
        {
          language: "fr",
          value: "Chaussures"
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
          value: "Shirt"
        },
        {
          language: "fr",
          value: "Chemise"
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

const mockNavigationTreeDoc = {
  _id: "navigationTree-1",
  name: "Default Navigation",
  shopId: internalShopId,
  items: [
    {
      isPrivate: true,
      isSecondary: false,
      isVisible: true,
      navigationItemId: "navigationItem-100"
    },
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: false,
      navigationItemId: "navigationItem-101",
      items: [
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: true,
          navigationItemId: "navigationItem-102",
          items: [
            {
              isPrivate: false,
              isSecondary: false,
              isVisible: true,
              navigationItemId: "navigationItem-103"
            }
          ]
        },
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: false,
          navigationItemId: "navigationItem-104"
        }
      ]
    }
  ],
  draftItems: [
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: false,
      navigationItemId: "navigationItem-100"
    },
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: false,
      navigationItemId: "navigationItem-101",
      items: [
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: false,
          navigationItemId: "navigationItem-102",
          items: [
            {
              isPrivate: false,
              isSecondary: false,
              isVisible: false,
              navigationItemId: "navigationItem-103"
            }
          ]
        },
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: false,
          navigationItemId: "navigationItem-104"
        }
      ]
    }
  ]
};

const mockNavigationTreeDoc2 = {
  _id: "navigationTree-2",
  name: "Alternate Navigation",
  shopId: internalShopId,
  hasUnpublishedChanges: false,
  items: [
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: true,
      navigationItemId: "navigationItem-110"
    },
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: true,
      navigationItemId: "navigationItem-100",
      items: [
        {
          isPrivate: false,
          isSecondary: true,
          isVisible: true,
          navigationItemId: "navigationItem-105",
          items: [
            {
              isPrivate: false,
              isSecondary: true,
              isVisible: true,
              navigationItemId: "navigationItem-110"
            },
            {
              isPrivate: true,
              isSecondary: true,
              isVisible: true,
              navigationItemId: "navigationItem-111"
            },
            {
              isPrivate: false,
              isSecondary: false,
              isVisible: false,
              navigationItemId: "navigationItem-112"
            }
          ]
        },
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: true,
          navigationItemId: "navigationItem-104"
        }
      ]
    }
  ],
  draftItems: [
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: false,
      navigationItemId: "navigationItem-110"
    },
    {
      isPrivate: false,
      isSecondary: false,
      isVisible: false,
      navigationItemId: "navigationItem-100",
      items: [
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: false,
          navigationItemId: "navigationItem-105"
        },
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: false,
          navigationItemId: "navigationItem-104"
        }
      ]
    }
  ]
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:navigationTrees/read:drafts", "reaction:legacy:navigationTrees/read"],
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
let queryNavigationTree;

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

  await testApp.collections.NavigationTrees.insertOne(mockNavigationTreeDoc);
  await testApp.collections.NavigationTrees.insertOne(mockNavigationTreeDoc2);

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  queryNavigationTree = testApp.query(navigationTreeQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("returns a NavigationItem tree named `Default Navigation` for an admin account", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await queryNavigationTree({
    id: encodeOpaqueId("reaction/navigationTree", "navigationTree-1"),
    language: "en",
    shopId: opaqueShopId
  });

  expect(result.navigationTreeById.name).toEqual("Default Navigation");
  expect(result.navigationTreeById.items[0].navigationItem.data.contentForLanguage).toEqual("Shoes");
  expect(result.navigationTreeById.draftItems[1].items[0].items[0].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-103"));
});

test("returns a NavigationItem tree named `Default Navigation` with no items for a customer account", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  const result = await queryNavigationTree({
    id: encodeOpaqueId("reaction/navigationTree", "navigationTree-1"),
    language: "en",
    shopId: opaqueShopId
  });

  expect(result.navigationTreeById.name).toEqual("Default Navigation");
  expect(result.navigationTreeById.items.length).toEqual(0);
});

test("returns a NavigationItem tree named `Alternate Navigation` for a customer account", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  const result = await queryNavigationTree({
    id: encodeOpaqueId("reaction/navigationTree", "navigationTree-2"),
    language: "fr",
    shopId: opaqueShopId
  });

  expect(result.navigationTreeById.name).toEqual("Alternate Navigation");
  expect(result.navigationTreeById.items[0].navigationItem.data.contentForLanguage).toEqual("Chaussures");
  expect(result.navigationTreeById.items[1].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-100"));
  expect(result.navigationTreeById.items[1].items.length).toEqual(1);
  expect(result.navigationTreeById.items[1].items[0].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-104"));
  expect(result.navigationTreeById.draftItems).toEqual([]);
});


test("returns a NavigationItem tree named `Alternate Navigation` with secondary items for a customer account", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  const result = await queryNavigationTree({
    id: encodeOpaqueId("reaction/navigationTree", "navigationTree-2"),
    language: "fr",
    shopId: opaqueShopId,
    shouldIncludeSecondary: true
  });

  expect(result.navigationTreeById.name).toEqual("Alternate Navigation");
  expect(result.navigationTreeById.items[0].navigationItem.data.contentForLanguage).toEqual("Chaussures");
  expect(result.navigationTreeById.items[1].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-100"));
  expect(result.navigationTreeById.items[1].items[0].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-105"));
  expect(result.navigationTreeById.items[1].items[1].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-104"));
  expect(result.navigationTreeById.items[1].items[0].items.length).toEqual(1);
  expect(result.navigationTreeById.items[1].items[0].items[0].navigationItem._id).toEqual(encodeOpaqueId("reaction/navigationItem", "navigationItem-110"));
});
