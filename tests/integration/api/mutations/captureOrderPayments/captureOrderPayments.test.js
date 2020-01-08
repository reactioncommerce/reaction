import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const captureOrderPayments = importAsString("./captureOrderPayments.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const orderId = "456";
const opaqueOrderId = encodeOpaqueId("reaction/order", orderId);
const paymentId = "789";
const opaquePaymentId = encodeOpaqueId("reaction/payment", paymentId);
const productId = "product1";
const productVariantId = "variant1";

const shopName = "Test Shop";

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [shopId]: ["admin", "orders"]
  },
  shopId
});

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

let testApp;
let captureOrderPaymentsMutation;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });
  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.publishProducts([productId]);

  await testApp.createUserAndAccount(mockAdminAccount);
  captureOrderPaymentsMutation = testApp.mutate(captureOrderPayments);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Products.deleteMany({});
  await testApp.stop();
});

test("an anonymous user should not be able to capture order payments", async () => {
  try {
    await captureOrderPaymentsMutation({
      input: {
        orderId: opaqueOrderId,
        paymentIds: [opaquePaymentId],
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("an admin user should be able to capture order payments", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  // Place an order
  const orderItem = Factory.OrderItem.makeOne({
    productId,
    variantId: productVariantId,
    quantity: 2,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const order = Factory.Order.makeOne({
    _id: orderId,
    accountId: "123",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: [orderItem]
      })
    ],
    payments: [Factory.Payment.makeOne({
      _id: paymentId,
      name: "iou_example",
      mode: "authorize",
      status: "approved"
    })],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  await testApp.collections.Orders.insertOne(order);

  // Verify order status is initially set to "approved" and mode to "authorize"
  const existingOrder = await testApp.collections.Orders.findOne({ _id: orderId });
  expect(existingOrder.payments[0].status).toEqual("approved");
  expect(existingOrder.payments[0].mode).toEqual("authorize");

  try {
    result = await captureOrderPaymentsMutation({
      input: {
        orderId: opaqueOrderId,
        paymentIds: [opaquePaymentId],
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.captureOrderPayments.order.payments[0].mode).toEqual("captured");
  expect(result.captureOrderPayments.order.payments[0].status).toEqual("completed");
});
