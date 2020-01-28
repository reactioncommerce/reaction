import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const SetAccountProfileCurrencyMutation = importAsString("./SetAccountProfileCurrencyMutation.graphql");

jest.setTimeout(300000);

let testApp;
let setAccountProfileCurrency;
let shopId;
let mockUserAccount;
let accountOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  setAccountProfileCurrency = testApp.mutate(SetAccountProfileCurrencyMutation);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:accounts/update:currency"],
    slug: "admin"
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [adminGroup._id]
  });

  accountOpaqueId = encodeOpaqueId("reaction/account", mockUserAccount._id);

  await testApp.createUserAndAccount(mockUserAccount, ["reaction:legacy:accounts/update:currency"]);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can set account profile currency", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  let result;
  try {
    result = await setAccountProfileCurrency({
      input: { accountId: accountOpaqueId, currencyCode: "INR" }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.setAccountProfileCurrency.account.currency).toEqual({ code: "INR", symbol: "₹" });
});

test("user can not set account profile currency if not logged in", async () => {
  try {
    await setAccountProfileCurrency({
      input: { accountId: accountOpaqueId, currencyCode: "INR" }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
