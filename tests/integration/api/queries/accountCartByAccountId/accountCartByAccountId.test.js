import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AccountCartByAccountIdQuery = importAsString("./AccountCartByAccountIdQuery.graphql");

jest.setTimeout(300000);

let accountCartByAccountIdQuery;
let mockCart;
let mockCustomerAccount;
let opaqueAccountId;
let shopId;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  accountCartByAccountIdQuery = testApp.query(AccountCartByAccountIdQuery);

  // create mock customer account
  mockCustomerAccount = Factory.Account.makeOne({
    _id: "mockCustomerAccountId",
    roles: {
      [shopId]: []
    },
    shopId
  });

  opaqueAccountId = encodeOpaqueId("reaction/account", mockCustomerAccount._id);

  // create mock cart
  mockCart = Factory.Cart.makeOne({
    shopId,
    accountId: mockCustomerAccount._id,
    shipping: null,
    items: [],
    workflow: null
  });

  await testApp.collections.Cart.insertOne(mockCart);
  await testApp.createUserAndAccount(mockCustomerAccount);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Cart.deleteMany({});
  await testApp.stop();
});

test("a logged in user can see his/her own cart", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  let result;
  try {
    result = await accountCartByAccountIdQuery({
      accountId: opaqueAccountId,
      shopId: encodeOpaqueId("reaction/shop", shopId)
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.accountCartByAccountId.account._id).toEqual(opaqueAccountId);
  // Expect the cart to be empty
  expect(result.accountCartByAccountId.items.totalCount).toEqual(0);
});
