import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeOrderOpaqueId, encodeOrderFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import UpdateOrderFulfillmentGroupMutation from "./UpdateOrderFulfillmentGroupMutation.graphql";

jest.setTimeout(300000);

let testApp;
let updateOrderFulfillmentGroup;
let catalogItem;
let mockOrdersAccount;
let shopId;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockOrdersAccount = Factory.Account.makeOne({
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
      variants: Factory.CatalogProductVariant.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  updateOrderFulfillmentGroup = testApp.mutate(UpdateOrderFulfillmentGroupMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("user with orders role can update an order fulfillment group", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItem = Factory.OrderItem.makeOne({
    productId: catalogItem.product.productId,
    quantity: 2,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group = Factory.OrderFulfillmentGroup.makeOne({
    items: [orderItem]
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    shipping: [group],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  let result;
  try {
    result = await updateOrderFulfillmentGroup({
      orderFulfillmentGroupId: encodeOrderFulfillmentGroupOpaqueId(group._id),
      orderId: encodeOrderOpaqueId(order._id),
      status: "NEW_STATUS",
      tracking: "TRACK_REF",
      trackingUrl: "http://track.me/TRACK_REF"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateOrderFulfillmentGroup.order.fulfillmentGroups[0].status).toBe("NEW_STATUS");
  expect(result.updateOrderFulfillmentGroup.order.fulfillmentGroups[0].tracking).toBe("TRACK_REF");
  expect(result.updateOrderFulfillmentGroup.order.fulfillmentGroups[0].trackingUrl).toBe("http://track.me/TRACK_REF");
});
