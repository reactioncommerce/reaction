import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";

const orderId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const fakeShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";


const order = Factory.Order.makeOne({
  _id: orderId,
  shopId: fakeShopId
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

  await testApp.insertPrimaryShop({ _id: fakeShopId, name: shopName });
  await testApp.collections.Orders.insertOne(order);
});

afterAll(() => testApp.stop());

function makeContext() {
  return { accountId: "unit-test-account-id", userHasPermission: () => true };
}

test("getOrderQuery shop admin", async () => {
  const shopId = "unit-test-shop-id";
  const orderId2 = "unit-test-order-id";
  const context = makeContext();
  const qq = await query(context, { _id: orderId2 }, shopId, null);
  expect(qq).toMatchObject({ _id: "unit-test-order-id", shopId });
  expect(qq.accountId).toBeUndefined();
});
