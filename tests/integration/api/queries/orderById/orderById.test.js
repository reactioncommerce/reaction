import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import getAnonymousAccessToken from "@reactioncommerce/api-utils/getAnonymousAccessToken.js";

jest.setTimeout(300000);

const mockShopId = "integ-test-shop-id";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDppbnRlZy10ZXN0LXNob3AtaWQ="; // reaction/order:integ-test-shop-id
const shopName = "Test Shop";

// --- Mock data for auth-ed order test
const orderId = "integ-test-order-id";
const opaqueOrderId = "cmVhY3Rpb24vb3JkZXI6aW50ZWctdGVzdC1vcmRlci1pZA=="; // reaction/order:integ-test-order-id

const accountId = "integ-test-account-id";
const opaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDppbnRlZy10ZXN0LWFjY291bnQtaWQ="; // reaction/account:integ-test-account-id

const mockOrdersAccount = Factory.Account.makeOne({
  _id: accountId
});

const order = Factory.Order.makeOne({
  _id: orderId,
  shopId: mockShopId,
  accountId: mockOrdersAccount._id
});
// --- End of mock data for Anon order test

// --- Mock data for Anon order test
const tokenInfo = getAnonymousAccessToken();
const orderIdAnon = "integ-test-order-id-anom";
const opaqueOrderIdAnon = "cmVhY3Rpb24vb3JkZXI6aW50ZWctdGVzdC1vcmRlci1pZC1hbm9t"; // reaction/order:integ-test-order-id-anom

// We set accountId: null in anom order because otherwise the factory sets it
// to default string data "mockAccountId", thinking it's an account order.
const orderAnon = Factory.Order.makeOne({
  _id: orderIdAnon,
  shopId: mockShopId,
  accountId: null,
  anonymousAccessTokens: [{ createdAt: tokenInfo.createdAt, hashedToken: tokenInfo.hashedToken }]
});
// ---- End of mock data for Anon order test

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
  await testApp.insertPrimaryShop({ _id: mockShopId, name: shopName });
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
  await testApp.collections.Orders.deleteMany({});
});

afterAll(() => testApp.stop());

test("get account order success", async () => {
  await testApp.collections.Orders.insertOne(order);
  await testApp.setLoggedInUser(mockOrdersAccount);
  const result = await query({ id: opaqueOrderId, shopId: opaqueShopId, token: null });
  expect(result.orderById.account._id).toBe(opaqueAccountId);
  expect(result.orderById.shop._id).toBe(opaqueShopId);
  expect(result.orderById.shop.name).toBe(shopName);
});

test("get anonymous order success", async () => {
  await testApp.collections.Orders.insertOne(orderAnon);
  const result = await query({ id: opaqueOrderIdAnon, shopId: opaqueShopId, token: tokenInfo.token });
  expect(result.orderById.shop._id).toBe(opaqueShopId);
  expect(result.orderById.shop.name).toBe(shopName);
});
