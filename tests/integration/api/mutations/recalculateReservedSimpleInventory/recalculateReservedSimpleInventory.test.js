import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

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

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [shopId]: ["reaction:legacy:inventory/update"]
  },
  shopId
});

let testApp;
let recalculateReservedSimpleInventoryMutation;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });

  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.collections.SimpleInventory.insertOne(simpleInventoryDoc);
  await testApp.publishProducts([productId]);

  await testApp.createUserAndAccount(mockAdminAccount);
  recalculateReservedSimpleInventoryMutation = testApp.mutate(recalculateReservedSimpleInventory);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Products.deleteMany({});
  await testApp.collections.SimpleInventory.deleteMany({});
  await testApp.stop();
});

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
