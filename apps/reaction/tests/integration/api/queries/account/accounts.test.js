import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const accountsQuery = importAsString("./accountsQuery.graphql");

jest.setTimeout(300000);

const decodeAccountOpaqueId = decodeOpaqueIdForNamespace("reaction/account");
const internalNonAdminAccountId = "123";
const internalAdminAccountId = "456";
const mockAccounts = [];

const mockCustomerGroup = {
  _id: "mockCustomerGroup",
  name: "customer",
  slug: "customer",
  permissions: [
    "test"
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

for (let index = 100; index < 136; index += 1) {
  const mockAccount = Factory.Account.makeOne({
    _id: `account-${index}`,
    username: `username-${index}`,
    groups: []
  });

  // Put only the first 5 in the permission group for the group filter test
  if (index < 105) {
    mockAccount.groups = [mockCustomerGroup._id];
  }

  mockAccounts.push(mockAccount);
}

let testApp;
let queryAccounts;
let mockAdminAccount;
let mockNonAdminAccount;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  // Create the test accounts before our accounts that we'll log in as. That way
  // we know what to expect from the query. Note that it's necessary to await each
  // one here rather than using Promise.all because otherwise there's no guarantee
  // they're created in order, which means we don't reliably know what the createdAt
  // sort will return.
  for (const account of mockAccounts) {
    await testApp.createUserAndAccount(account); // eslint-disable-line no-await-in-loop
  }

  const globalAdminGroup = Factory.Group.makeOne({
    _id: "globalAdminGroup",
    createdBy: null,
    name: "globalAdmin",
    permissions: [
      "reaction:legacy:groups/read",
      "reaction:legacy:accounts/read"
    ],
    slug: "global-admin",
    shopId: null
  });
  await testApp.collections.Groups.insertOne(globalAdminGroup);

  mockAdminAccount = Factory.Account.makeOne({
    _id: internalAdminAccountId,
    groups: ["globalAdminGroup"]
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockNonAdminAccount = Factory.Account.makeOne({
    _id: internalNonAdminAccountId
  });
  await testApp.createUserAndAccount(mockNonAdminAccount);

  queryAccounts = testApp.query(accountsQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("get all accounts with default createdAt ascending sort", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryAccounts({
      first: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.accounts.nodes.length).toBe(10);
  expect(decodeAccountOpaqueId(result.accounts.nodes[0]._id)).toBe("account-100");
  expect(decodeAccountOpaqueId(result.accounts.nodes[1]._id)).toBe("account-101");
});

test("get all accounts sorted by ID", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryAccounts({
      first: 10,
      sortBy: "_id"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.accounts.nodes.length).toBe(10);
  expect(decodeAccountOpaqueId(result.accounts.nodes[0]._id)).toBe(internalNonAdminAccountId);
  expect(decodeAccountOpaqueId(result.accounts.nodes[1]._id)).toBe(internalAdminAccountId);
});

test("get all accounts sorted by createdAt descending", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryAccounts({
      first: 10,
      sortBy: "createdAt",
      sortOrder: "desc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.accounts.nodes.length).toBe(10);
  expect(decodeAccountOpaqueId(result.accounts.nodes[0]._id)).toBe(internalNonAdminAccountId);
  expect(decodeAccountOpaqueId(result.accounts.nodes[1]._id)).toBe(internalAdminAccountId);
});

test("get only accounts in a certain permission group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryAccounts({
      first: 10,
      groupIds: [encodeOpaqueId("reaction/group", mockCustomerGroup._id)]
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.accounts.nodes.length).toBe(5);
  expect(decodeAccountOpaqueId(result.accounts.nodes[0]._id)).toBe("account-100");
  expect(decodeAccountOpaqueId(result.accounts.nodes[1]._id)).toBe("account-101");
  expect(decodeAccountOpaqueId(result.accounts.nodes[2]._id)).toBe("account-102");
  expect(decodeAccountOpaqueId(result.accounts.nodes[3]._id)).toBe("account-103");
  expect(decodeAccountOpaqueId(result.accounts.nodes[4]._id)).toBe("account-104");
});

test("throws access-denied when getting accounts if not an admin", async () => {
  await testApp.setLoggedInUser(mockNonAdminAccount);

  try {
    await queryAccounts({
      first: 10
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
    return;
  }
});
