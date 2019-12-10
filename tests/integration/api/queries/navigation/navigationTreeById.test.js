import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

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

const mockCustomerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["read-navigation"]
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
let queryNavigationTree;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await Promise.all(navigationItemDocuments.map((doc) => (
    testApp.collections.NavigationItems.insertOne(doc)
  )));

  await testApp.collections.NavigationTrees.insertOne(mockNavigationTreeDoc);
  await testApp.collections.NavigationTrees.insertOne(mockNavigationTreeDoc2);

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  queryNavigationTree = testApp.query(navigationTreeQuery);
});

afterAll(async () => {
  await testApp.collections.NavigationItems.deleteMany({});
  await testApp.collections.NavigationTrees.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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
