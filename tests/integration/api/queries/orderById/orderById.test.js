import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";

const shopId = "integ-test-shop-id";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDppbnRlZy10ZXN0LXNob3AtaWQ="; // reaction/order:integ-test-shop-id
const shopName = "Test Shop";

const orderId = "integ-test-order-id";
const opaqueOrderId = "cmVhY3Rpb24vb3JkZXI6aW50ZWctdGVzdC1vcmRlci1pZA=="; // reaction/order:integ-test-order-id

const accountId = "integ-test-account-id";
const opaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDppbnRlZy10ZXN0LWFjY291bnQtaWQ="; // reaction/account:integ-test-account-id

const mockOrdersAccount = Factory.Accounts.makeOne({
  _id: accountId
});

const order = Factory.Order.makeOne({
  _id: orderId,
  shopId: shopId,
  accountId: mockOrdersAccount._id
});

const orderByIdQuery = `query ($id: ID!, $shopId: ID!, $token: String) {
  orderById(id: $id, shopId: $shopId, token: $token) {
    account {
      _id
    }
    shop {
      _id
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

  await testApp.createUserAndAccount(mockOrdersAccount);
  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });
});

afterAll(() => testApp.stop());

beforeEach(async () => {
  await testApp.collections.Orders.deleteMany({});
});

test("get account order success", async () => {
  await testApp.collections.Orders.insertOne(order);
  await testApp.setLoggedInUser(mockOrdersAccount);
  const result = await query({ id: opaqueOrderId, shopId: opaqueShopId, token: null });
  expect(result.orderById.account._id).toBe(opaqueAccountId);
  expect(result.orderById.shop._id).toBe(opaqueShopId);
  expect(result.orderById.shop.name).toBe(shopName);
});

