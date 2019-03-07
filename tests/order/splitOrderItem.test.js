import Factory from "/imports/test-utils/helpers/factory";
import { encodeOrderOpaqueId, encodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import TestApp from "../TestApp";
import SplitOrderItemMutation from "./SplitOrderItemMutation.graphql";

jest.setTimeout(300000);

let testApp;
let splitOrderItem;
let catalogItem;
let mockOrdersAccount;
let shopId;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockOrdersAccount = Factory.Accounts.makeOne({
    roles: {
      [shopId]: ["orders"]
    }
  });
  await testApp.createUserAndAccount(mockOrdersAccount);

  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogVariantSchema.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  splitOrderItem = testApp.mutate(SplitOrderItemMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.remove({});
  await testApp.collections.Shops.remove({});
  testApp.stop();
});

test("user with orders permission can split an order item", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItem = Factory.OrderItem.makeOne({
    productId: catalogItem.product.productId,
    quantity: 3,
    variantId: catalogItem.product.variants[0].variantId,
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
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  let result;
  try {
    result = await splitOrderItem({
      itemId: encodeOrderItemOpaqueId(orderItem._id),
      newItemQuantity: 2,
      orderId: encodeOrderOpaqueId(order._id)
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.splitOrderItem.newItemId).toEqual(jasmine.any(String));

  const group = result.splitOrderItem.order.fulfillmentGroups[0];
  const items = group.items.nodes;
  const existingItem = items.find((item) => item._id === encodeOrderItemOpaqueId(orderItem._id));
  const newItem = items.find((item) => item._id !== encodeOrderItemOpaqueId(orderItem._id));

  expect(existingItem.quantity).toBe(1);
  expect(newItem.quantity).toBe(2);
  expect(newItem.status).toBe(existingItem.status);
  expect(existingItem.productConfiguration.productVariantId).toBe(newItem.productConfiguration.productVariantId);
});
