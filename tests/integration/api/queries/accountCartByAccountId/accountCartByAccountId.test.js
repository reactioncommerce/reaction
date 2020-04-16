import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AccountCartByAccountIdQuery = importAsString("./AccountCartByAccountIdQuery.graphql");

jest.setTimeout(300000);

let accountCartByAccountIdQuery;
let mockCart;
let mockCustomerAccount;
let opaqueAccountId;
let shopId;
let testApp;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);
  accountCartByAccountIdQuery = testApp.query(AccountCartByAccountIdQuery);

  const customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    createdBy: null,
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  // create mock customer account
  mockCustomerAccount = Factory.Account.makeOne({
    _id: "mockCustomerAccountId",
    groups: [customerGroup._id],
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

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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
