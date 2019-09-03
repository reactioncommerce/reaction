import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";


const orderId = "integ-test-order-id";
// reaction/order:integ-test-order-id
const opaqueOrderId = "cmVhY3Rpb24vb3JkZXI6aW50ZWctdGVzdC1vcmRlci1pZA==";

// reaction/order:integ-test-shop-id
const shopId = "integ-test-shop-id";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDppbnRlZy10ZXN0LXNob3AtaWQ=";

const shopName = "Test Shop";

const order = Factory.Order.makeOne({
  _id: orderId,
  shopId: shopId
});

const orderByIdQuery = `query ($id: ID!, $shopId: ID!, $token: String) {
  orderById(id: $id, shopId: $shopId, token: $token) {
    shop {
      name
    }
  }
}`;

let testApp;
let query;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  query = testApp.query(orderByIdQuery);

  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });
  await testApp.collections.Orders.insertOne(order);
});

afterAll(() => testApp.stop());

test("get order successful", async () => {
  const result = await query({ id: opaqueOrderId, shopId: opaqueShopId, token: null });
  expect(result._id).toBe(opaqueOrderId);
  expect(result.shop.name).toBe(shopName);
  expect(result.shop.shopId).toBe(opaqueShopId);
  expect(result.accountId).toBeUndefined();
});
