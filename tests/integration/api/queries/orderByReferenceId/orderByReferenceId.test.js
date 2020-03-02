import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import getAnonymousAccessToken from "@reactioncommerce/api-utils/getAnonymousAccessToken.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const OrderByReferenceIdQuery = importAsString("./OrderByReferenceIdQuery.graphql");

jest.setTimeout(300000);

// Mock data for logged-in user test
const mockShopId = "integ-test-shop-id";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDppbnRlZy10ZXN0LXNob3AtaWQ=";
const shopName = "Test Shop";
const orderId = "integ-test-order-id";
const orderReferenceId = "123456789";
const accountId = "integ-test-account-id";
const opaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDppbnRlZy10ZXN0LWFjY291bnQtaWQ=";

const mockOrdersAccount = Factory.Account.makeOne({
  _id: accountId
});

const order = Factory.Order.makeOne({
  _id: orderId,
  referenceId: orderReferenceId,
  shopId: mockShopId,
  accountId: mockOrdersAccount._id
});

// Mock data for anonymous user order test
// const tokenInfo = hashToken(token);
const tokenInfo = getAnonymousAccessToken();
const orderIdAnon = "integ-test-order-id-anom";
const orderReferenceIdAnon = "123456789-anon";

const orderAnon = Factory.Order.makeOne({
  _id: orderIdAnon,
  referenceId: orderReferenceIdAnon,
  shopId: mockShopId,
  accountId: null,
  anonymousAccessTokens: [{ createdAt: tokenInfo.createdAt, hashedToken: tokenInfo.hashedToken }]
});

// Create test app
let testApp;
let query;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(OrderByReferenceIdQuery);
  await testApp.createUserAndAccount(mockOrdersAccount);
  await testApp.insertPrimaryShop({ _id: mockShopId, name: shopName });
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
  await testApp.collections.Orders.deleteMany({});
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("get account order success", async () => {
  // Set up initial data state
  await testApp.collections.Orders.insertOne(order);
  await testApp.setLoggedInUser(mockOrdersAccount);

  // Query for order and check results
  const result = await query({ orderReferenceId, shopId: opaqueShopId, token: null });
  expect(result.orderByReferenceId.account._id).toBe(opaqueAccountId);
  expect(result.orderByReferenceId.shop._id).toBe(opaqueShopId);
  expect(result.orderByReferenceId.shop.name).toBe(shopName);
});

test("get not found error for order that does not exist", async () => {
  await testApp.collections.Orders.insertOne(order);
  await testApp.setLoggedInUser(mockOrdersAccount);
  try {
    await query({ orderReferenceId: "does-not-exist", shopId: opaqueShopId, token: null });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("get invalid params error", async () => {
  await testApp.collections.Orders.insertOne(orderAnon);
  try {
    await query({ orderReferenceId: orderReferenceIdAnon });
  } catch (error) {
    expect(error[0].message).toBe('Variable "$shopId" of required type "ID!" was not provided.');
  }
});

test("get anonymous order success", async () => {
  await testApp.collections.Orders.insertOne(orderAnon);
  const result = await query({ orderReferenceId: orderReferenceIdAnon, shopId: opaqueShopId, token: tokenInfo.token });
  expect(result.orderByReferenceId.shop._id).toBe(opaqueShopId);
  expect(result.orderByReferenceId.shop.name).toBe(shopName);
});
