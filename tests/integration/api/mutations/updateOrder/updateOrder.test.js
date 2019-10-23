import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import UpdateOrderMutation from "./UpdateOrderMutation.graphql";

jest.setTimeout(300000);

let testApp;
let updateOrder;
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

  updateOrder = testApp.mutate(UpdateOrderMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("user with orders role can update an order", async () => {
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
    result = await updateOrder({
      email: "new@email.com",
      orderId: encodeOrderOpaqueId(order._id),
      status: "NEW_STATUS"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateOrder.order.email).toBe("new@email.com");
  expect(result.updateOrder.order.status).toBe("NEW_STATUS");
});
