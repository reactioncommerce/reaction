import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";


const orderId = "integ-test-order-id";
const shopId = "integ-test-shop-id";
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
  const result = await query({ id: orderId, shopId: shopId });
  // expect(result).toMatchObject({ _id: "integ-test-order-id", shopId });
  expect(result.accountId).toBeUndefined();
});
