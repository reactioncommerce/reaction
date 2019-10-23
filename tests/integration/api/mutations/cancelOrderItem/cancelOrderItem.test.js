import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeOrderOpaqueId, encodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import CancelOrderItemMutation from "./CancelOrderItemMutation.graphql";

jest.setTimeout(300000);

let testApp;
let cancelOrderItem;
let catalogItem;
let shopId;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  cancelOrderItem = testApp.mutate(CancelOrderItemMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

const accountInternalId = "123";

test("user who placed an order can cancel an order item", async () => {
  await testApp.setLoggedInUser({ _id: accountInternalId });

  const orderItem = Factory.OrderItem.makeOne({
    productId: catalogItem.product.productId,
    quantity: 2,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const order = Factory.Order.makeOne({
    accountId: accountInternalId,
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
    result = await cancelOrderItem({
      cancelQuantity: orderItem.quantity,
      itemId: encodeOrderItemOpaqueId(orderItem._id),
      orderId: encodeOrderOpaqueId(order._id),
      reason: "REASON"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.cancelOrderItem.order).toEqual({
    fulfillmentGroups: [
      {
        items: {
          nodes: [
            {
              cancelReason: "REASON",
              quantity: orderItem.quantity,
              status: "coreOrderItemWorkflow/canceled"
            }
          ]
        },
        status: "coreOrderWorkflow/canceled"
      }
    ],
    status: "coreOrderWorkflow/canceled"
  });
});
