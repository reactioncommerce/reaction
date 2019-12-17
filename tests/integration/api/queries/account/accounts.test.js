import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const accountsQuery = importAsString("./accountsQuery.graphql");

jest.setTimeout(300000);

const internalNonAdminAccountId = "123";
const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalAdminAccountId = "456";
const mockAccounts = [];

for (let index = 100; index < 136; index += 1) {
  const mockAccount = Factory.Account.makeOne({
    _id: `account-${index}`,
    shopId: internalShopId,
    username: `username-${index}`,
    groups: [
      "group-customer"
    ]
  });

  mockAccounts.push(mockAccount);
}

const mockCustomerGroup = {
  _id: "group-customer",
  name: "customer",
  slug: "customer",
  permissions: [
    "guest",
    "account/profile",
    "product",
    "tag",
    "index",
    "cart/checkout",
    "cart/completed",
    "notifications",
    "reaction-paypal/paypalDone",
    "reaction-paypal/paypalCancel",
    "stripe/connect/authorize",
    "account/verify",
    "account/login",
    "reset-password",
    "not-found",
    "account/enroll"
  ],
  shopId: internalShopId,
  createdAt: "2018-06-22T20:35:33.369Z",
  updatedAt: "2019-04-30T19:02:34.276Z"
};

let testApp;
let queryAccounts;
let mockAdminAccount;
let mockNonAdminAccount;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  mockAdminAccount = Factory.Account.makeOne({
    _id: internalAdminAccountId,
    shopId: internalShopId
  });
  await testApp.createUserAndAccount(mockAdminAccount, ["reaction-accounts"]);

  mockNonAdminAccount = Factory.Account.makeOne({
    _id: internalNonAdminAccountId
  });
  await testApp.createUserAndAccount(mockNonAdminAccount);

  await testApp.collections.Groups.insertOne(mockCustomerGroup);

  await Promise.all(mockAccounts.map((account) => (
    testApp.createUserAndAccount(account, ["guest", "customer"])
  )));

  queryAccounts = testApp.query(accountsQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Groups.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});


test("get all non-admin accounts", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryAccounts({
      shopId: opaqueShopId,
      first: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.accounts.nodes.length).toEqual(10);
  expect(result.accounts.nodes[0]._id).toEqual(encodeOpaqueId("reaction/account", "account-100"));
  expect(result.accounts.nodes[1]._id).toEqual(encodeOpaqueId("reaction/account", "account-101"));
});

test("throws access-denied when getting accounts if not an admin", async () => {
  await testApp.setLoggedInUser(mockNonAdminAccount);

  try {
    await queryAccounts({
      shopId: opaqueShopId,
      first: 10
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
    return;
  }
});
