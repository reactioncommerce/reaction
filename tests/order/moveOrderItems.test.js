import Factory from "/imports/test-utils/helpers/factory";
import {
  encodeOrderFulfillmentGroupOpaqueId,
  encodeOrderItemOpaqueId,
  encodeOrderOpaqueId
} from "@reactioncommerce/reaction-graphql-xforms/order";
import TestApp from "../TestApp";
import MoveOrderItemsMutation from "./MoveOrderItemsMutation.graphql";

jest.setTimeout(300000);

let testApp;
let moveOrderItems;
let catalogItem;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop();

  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogVariantSchema.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  moveOrderItems = testApp.mutate(MoveOrderItemsMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.remove({});
  await testApp.collections.Shops.remove({});
  testApp.stop();
});

const accountInternalId = "123";

test("user who placed an order can move an order item", async () => {
  await testApp.setLoggedInUser({ _id: accountInternalId });

  const group1Items = Factory.OrderItem.makeMany(3, {
    productId: catalogItem.product.productId,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group2Items = Factory.OrderItem.makeMany(2, {
    productId: catalogItem.product.productId,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group1 = Factory.OrderFulfillmentGroup.makeOne({
    items: group1Items
  });

  const group2 = Factory.OrderFulfillmentGroup.makeOne({
    items: group2Items
  });

  const order = Factory.Order.makeOne({
    accountId: accountInternalId,
    shipping: [group1, group2],
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  const group1OpaqueId = encodeOrderFulfillmentGroupOpaqueId(group1._id);
  const group2OpaqueId = encodeOrderFulfillmentGroupOpaqueId(group2._id);

  let result;
  try {
    result = await moveOrderItems({
      fromFulfillmentGroupId: group1OpaqueId,
      itemIds: [encodeOrderItemOpaqueId(group1Items[0]._id), encodeOrderItemOpaqueId(group1Items[1]._id)],
      orderId: encodeOrderOpaqueId(order._id),
      toFulfillmentGroupId: group2OpaqueId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const updatedGroup1 = result.moveOrderItems.order.fulfillmentGroups.find((group) =>
    group._id === group1OpaqueId);

  const updatedGroup2 = result.moveOrderItems.order.fulfillmentGroups.find((group) =>
    group._id === group2OpaqueId);

  expect(updatedGroup1.items.nodes.length).toBe(1);
  expect(updatedGroup2.items.nodes.length).toBe(4);
});
