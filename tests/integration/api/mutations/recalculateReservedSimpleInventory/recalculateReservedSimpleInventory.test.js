import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const recalculateReservedSimpleInventory = importAsString("./recalculateReservedSimpleInventory.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const productId = "product1";
const opaqueProductId = encodeOpaqueId("reaction/product", productId);
const productVariantId = "variant1";
const opaqueVariantId = encodeOpaqueId("reaction/product", productVariantId);
const shopName = "Test Shop";

const product = Factory.Product.makeOne({
  _id: productId,
  ancestors: [],
  handle: "test-product",
  isDeleted: false,
  isVisible: true,
  shopId,
  type: "simple"
});

const variant = Factory.Product.makeOne({
  _id: productVariantId,
  ancestors: [productId],
  attributeLabel: "Variant",
  isDeleted: false,
  isVisible: true,
  shopId,
  type: "variant"
});

const simpleInventoryDoc = Factory.SimpleInventory.makeOne({
  productConfiguration: {
    productId,
    productVariantId
  },
  isEnabled: true,
  inventoryInStock: 10,
  inventoryReserved: 0,
  shopId
});

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:inventory/update"],
  slug: "admin",
  shopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId
});

let testApp;
let recalculateReservedSimpleInventoryMutation;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });

  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.collections.SimpleInventory.insertOne(simpleInventoryDoc);
  await testApp.publishProducts([productId]);
  await testApp.collections.Groups.insertOne(adminGroup);

  await testApp.createUserAndAccount(mockAdminAccount);
  recalculateReservedSimpleInventoryMutation = testApp.mutate(recalculateReservedSimpleInventory);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("anonymous users cannot recalculate simple inventory", async () => {
  try {
    await recalculateReservedSimpleInventoryMutation({
      input: {
        productConfiguration: {
          productId: opaqueProductId,
          productVariantId: opaqueVariantId
        },
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("recalculate reserved simple inventory based an placed orders", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let firstResult;
  try {
    firstResult = await recalculateReservedSimpleInventoryMutation({
      input: {
        productConfiguration: {
          productId: opaqueProductId,
          productVariantId: opaqueVariantId
        },
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(firstResult.recalculateReservedSimpleInventory.inventoryInfo.inventoryReserved).toEqual(0);

  // Place an order to reduce the in-stock inventory
  const orderItem = Factory.OrderItem.makeOne({
    productId,
    quantity: 2,
    variantId: productVariantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: [orderItem]
      })
    ],
    payments: [Factory.Payment.makeOne({
      status: "created"
    })],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  await testApp.collections.Orders.insertOne(order);

  let result;
  try {
    result = await recalculateReservedSimpleInventoryMutation({
      input: {
        productConfiguration: {
          productId: opaqueProductId,
          productVariantId: opaqueVariantId
        },
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.recalculateReservedSimpleInventory.inventoryInfo.inventoryReserved).toEqual(2);
});
