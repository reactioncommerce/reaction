import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const catalogItemQuery = importAsString("./catalogItemQuery.graphql");
const simpleInventoryQuery = importAsString("./simpleInventoryQuery.graphql");
const updateSimpleInventoryMutation = importAsString("./updateSimpleInventoryMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalProductId = "product1";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDpwcm9kdWN0MQ==";
const internalVariantId = "variant1";
const internalOptionId1 = "option1";
const opaqueOptionId1 = "cmVhY3Rpb24vcHJvZHVjdDpvcHRpb24x";
const internalOptionId2 = "option2";
const opaqueOptionId2 = "cmVhY3Rpb24vcHJvZHVjdDpvcHRpb24y";
const shopName = "Test Shop";

const product = Factory.Product.makeOne({
  _id: internalProductId,
  ancestors: [],
  handle: "product1",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "simple"
});

const variant = Factory.Product.makeOne({
  _id: internalVariantId,
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "variant"
});

const option1 = Factory.Product.makeOne({
  _id: internalOptionId1,
  ancestors: [internalProductId, internalVariantId],
  attributeLabel: "Option",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "variant"
});

const option2 = Factory.Product.makeOne({
  _id: internalOptionId2,
  ancestors: [internalProductId, internalVariantId],
  attributeLabel: "Option",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "variant"
});

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:inventory/read", "reaction:legacy:inventory/update"],
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
let getCatalogItem;
let simpleInventory;
let updateSimpleInventory;
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

  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.collections.Products.insertOne(option1);
  await testApp.collections.Products.insertOne(option2);

  await testApp.publishProducts([internalProductId]);

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockCustomerAccount);

  getCatalogItem = testApp.query(catalogItemQuery);
  simpleInventory = testApp.query(simpleInventoryQuery);
  updateSimpleInventory = testApp.mutate(updateSimpleInventoryMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("throws access-denied when updating simpleInventory if not an admin", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await updateSimpleInventory({
      input: {
        productConfiguration: {
          productId: opaqueProductId,
          productVariantId: opaqueOptionId1
        },
        shopId: opaqueShopId,
        isEnabled: true
      }
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("returns SimpleInventory record", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const mutationResult = await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true
    }
  });
  expect(mutationResult).toEqual({
    updateSimpleInventory: {
      inventoryInfo: {
        canBackorder: false,
        inventoryInStock: 0,
        inventoryReserved: 0,
        isEnabled: true,
        lowInventoryWarningThreshold: 0
      }
    }
  });

  const mutationResult2 = await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      canBackorder: true,
      inventoryInStock: 20,
      lowInventoryWarningThreshold: 2
    }
  });
  expect(mutationResult2).toEqual({
    updateSimpleInventory: {
      inventoryInfo: {
        canBackorder: true,
        inventoryInStock: 20,
        inventoryReserved: 0,
        isEnabled: true,
        lowInventoryWarningThreshold: 2
      }
    }
  });

  const queryResult = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(queryResult).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 20,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });
});

test("when all options are sold out and canBackorder, isBackorder is true in Catalog", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 0
    }
  });

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId2
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 0
    }
  });

  const queryResult = await getCatalogItem({
    slugOrId: product.handle
  });
  expect(queryResult).toEqual({
    catalogItemProduct: {
      product: {
        isBackorder: true,
        isLowQuantity: true,
        isSoldOut: true,
        variants: [{
          canBackorder: true,
          inventoryAvailableToSell: 0,
          inventoryInStock: 0,
          isBackorder: true,
          isLowQuantity: true,
          isSoldOut: true,
          options: [
            {
              canBackorder: true,
              inventoryAvailableToSell: 0,
              inventoryInStock: 0,
              isBackorder: true,
              isLowQuantity: true,
              isSoldOut: true
            },
            {
              canBackorder: true,
              inventoryAvailableToSell: 0,
              inventoryInStock: 0,
              isBackorder: true,
              isLowQuantity: true,
              isSoldOut: true
            }
          ]
        }]
      }
    }
  });
});

test("when all options are sold out and canBackorder is false, isBackorder is false in Catalog", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: false,
      inventoryInStock: 0
    }
  });

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId2
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: false,
      inventoryInStock: 0
    }
  });

  const queryResult = await getCatalogItem({
    slugOrId: product.handle
  });
  expect(queryResult).toEqual({
    catalogItemProduct: {
      product: {
        isBackorder: false,
        isLowQuantity: true,
        isSoldOut: true,
        variants: [{
          canBackorder: false,
          inventoryAvailableToSell: 0,
          inventoryInStock: 0,
          isBackorder: false,
          isLowQuantity: true,
          isSoldOut: true,
          options: [
            {
              canBackorder: false,
              inventoryAvailableToSell: 0,
              inventoryInStock: 0,
              isBackorder: false,
              isLowQuantity: true,
              isSoldOut: true
            },
            {
              canBackorder: false,
              inventoryAvailableToSell: 0,
              inventoryInStock: 0,
              isBackorder: false,
              isLowQuantity: true,
              isSoldOut: true
            }
          ]
        }]
      }
    }
  });
});

test("when one option is backordered, isBackorder is true for product in Catalog", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: false,
      inventoryInStock: 10
    }
  });

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId2
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 0
    }
  });

  const queryResult = await getCatalogItem({
    slugOrId: product.handle
  });
  expect(queryResult).toEqual({
    catalogItemProduct: {
      product: {
        isBackorder: false,
        isLowQuantity: true,
        isSoldOut: false,
        variants: [{
          canBackorder: true,
          inventoryAvailableToSell: 10,
          inventoryInStock: 10,
          isBackorder: false,
          isLowQuantity: true,
          isSoldOut: false,
          options: [
            {
              canBackorder: false,
              inventoryAvailableToSell: 10,
              inventoryInStock: 10,
              isBackorder: false,
              isLowQuantity: false,
              isSoldOut: false
            },
            {
              canBackorder: true,
              inventoryAvailableToSell: 0,
              inventoryInStock: 0,
              isBackorder: true,
              isLowQuantity: true,
              isSoldOut: true
            }
          ]
        }]
      }
    }
  });
});

test("all options available", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 10
    }
  });

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId2
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 20
    }
  });

  const queryResult = await getCatalogItem({
    slugOrId: product.handle
  });
  expect(queryResult).toEqual({
    catalogItemProduct: {
      product: {
        isBackorder: false,
        isLowQuantity: false,
        isSoldOut: false,
        variants: [{
          canBackorder: true,
          inventoryAvailableToSell: 30,
          inventoryInStock: 30,
          isBackorder: false,
          isLowQuantity: false,
          isSoldOut: false,
          options: [
            {
              canBackorder: true,
              inventoryAvailableToSell: 10,
              inventoryInStock: 10,
              isBackorder: false,
              isLowQuantity: false,
              isSoldOut: false
            },
            {
              canBackorder: true,
              inventoryAvailableToSell: 20,
              inventoryInStock: 20,
              isBackorder: false,
              isLowQuantity: false,
              isSoldOut: false
            }
          ]
        }]
      }
    }
  });
});

test("simple-inventory updates during standard order flow", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 10
    }
  });

  const order = {
    payments: [],
    shipping: [
      {
        items: [
          {
            productId: internalProductId,
            quantity: 2,
            variantId: internalOptionId1
          }
        ]
      }
    ],
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  };

  await testApp.context.appEvents.emit("afterOrderCreate", { order });

  let result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 10,
      inventoryReserved: 2,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });

  await testApp.context.appEvents.emit("afterOrderApprovePayment", { order });

  result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 8,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });
});

test("simple-inventory updates when canceling before approve", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 10
    }
  });

  const order = {
    payments: [
      {
        status: "created"
      }
    ],
    shipping: [
      {
        items: [
          {
            productId: internalProductId,
            quantity: 2,
            variantId: internalOptionId1
          }
        ]
      }
    ],
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  };

  await testApp.context.appEvents.emit("afterOrderCreate", { order });

  let result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 10,
      inventoryReserved: 2,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });

  await testApp.context.appEvents.emit("afterOrderCancel", { order });

  result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 10,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });
});

test("simple-inventory updates when canceling after approve, do not return to stock", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 10
    }
  });

  const order = {
    payments: [
      {
        status: "created"
      }
    ],
    shipping: [
      {
        items: [
          {
            productId: internalProductId,
            quantity: 2,
            variantId: internalOptionId1
          }
        ]
      }
    ],
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  };

  await testApp.context.appEvents.emit("afterOrderCreate", { order });

  let result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 10,
      inventoryReserved: 2,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });

  order.payments[0].status = "approved";
  await testApp.context.appEvents.emit("afterOrderApprovePayment", { order });

  result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 8,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });

  await testApp.context.appEvents.emit("afterOrderCancel", { order, returnToStock: false });

  result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 8,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });
});

test("simple-inventory updates when canceling after approve, do return to stock", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await updateSimpleInventory({
    input: {
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId,
      isEnabled: true,
      canBackorder: true,
      inventoryInStock: 10
    }
  });

  const order = {
    payments: [
      {
        status: "created"
      }
    ],
    shipping: [
      {
        items: [
          {
            productId: internalProductId,
            quantity: 2,
            variantId: internalOptionId1
          }
        ]
      }
    ],
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  };

  await testApp.context.appEvents.emit("afterOrderCreate", { order });

  let result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 10,
      inventoryReserved: 2,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });

  order.payments[0].status = "approved";
  await testApp.context.appEvents.emit("afterOrderApprovePayment", { order });

  result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 8,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });

  await testApp.context.appEvents.emit("afterOrderCancel", { order, returnToStock: true });

  result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: {
      canBackorder: true,
      inventoryInStock: 10,
      inventoryReserved: 0,
      isEnabled: true,
      lowInventoryWarningThreshold: 2
    }
  });
});
