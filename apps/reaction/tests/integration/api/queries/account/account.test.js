import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AccountFullQuery = importAsString("./AccountFullQuery.graphql");

jest.setTimeout(300000);

const internalNonAdminAccountId = "123";
const opaqueNonAdminAccountId = "cmVhY3Rpb24vYWNjb3VudDoxMjM=";
const internalAdminAccountId = "456";
const internalOtherAccountId = "789";
const opaqueOtherAccountId = "cmVhY3Rpb24vYWNjb3VudDo3ODk=";
const internalGroupId = "mockCustomerGroup";
const opaqueGroupId = "cmVhY3Rpb24vZ3JvdXA6bW9ja0N1c3RvbWVyR3JvdXA=";

const mockCustomerGroup = {
  _id: internalGroupId,
  name: "customer",
  slug: "customer",
  permissions: [
    "test"
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

let testApp;
let accountQuery;
let mockNonAdminAccount;
let mockAdminAccount;
let mockOtherAccount;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await testApp.collections.Groups.insertOne(mockCustomerGroup);

  mockNonAdminAccount = Factory.Account.makeOne({
    _id: internalNonAdminAccountId
  });
  await testApp.createUserAndAccount(mockNonAdminAccount);

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

  mockOtherAccount = Factory.Account.makeOne({
    _id: internalOtherAccountId,
    groups: [mockCustomerGroup._id]
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  accountQuery = testApp.query(AccountFullQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  try {
    await accountQuery({ id: opaqueNonAdminAccountId });
  } catch (error) {
    expect(error[0].message).toBe("Access Denied");
  }
});

describe("authenticated, non-admin", () => {
  beforeAll(async () => {
    await testApp.setLoggedInUser(mockNonAdminAccount);
  });

  afterAll(async () => {
    await testApp.clearLoggedInUser();
  });

  test("get own account", async () => {
    const result = await accountQuery({ id: opaqueNonAdminAccountId });
    expect(result).toEqual({
      account: {
        _id: opaqueNonAdminAccountId,
        addressBook: {
          nodes: [
            { address1: "mockAddress1" }
          ]
        },
        createdAt: jasmine.any(String),
        currency: null,
        emailRecords: [
          {
            address: mockNonAdminAccount.emails[0].address,
            verified: mockNonAdminAccount.emails[0].verified
          }
        ],
        groups: {
          nodes: []
        },
        metafields: [
          {
            description: "mockDescription",
            key: "mockKey",
            namespace: "mockNamespace",
            scope: "mockScope",
            value: "mockValue",
            valueType: "mockValueType"
          }
        ],
        name: "mockName",
        note: "mockNote",
        preferences: {},
        updatedAt: jasmine.any(String)
      }
    });
  });

  test("get other account", async () => {
    try {
      await accountQuery({ id: opaqueOtherAccountId });
    } catch (error) {
      expect(error[0].message).toBe("Access Denied");
    }
  });
});

describe("authenticated, admin", () => {
  beforeAll(async () => {
    await testApp.setLoggedInUser(mockAdminAccount);
  });

  afterAll(async () => {
    await testApp.clearLoggedInUser();
  });

  test("get other account", async () => {
    const result = await accountQuery({ id: opaqueOtherAccountId });
    expect(result).toEqual({
      account: {
        _id: opaqueOtherAccountId,
        addressBook: {
          nodes: [
            { address1: "mockAddress1" }
          ]
        },
        createdAt: jasmine.any(String),
        currency: null,
        emailRecords: [
          {
            address: mockOtherAccount.emails[0].address,
            verified: mockOtherAccount.emails[0].verified
          }
        ],
        groups: {
          nodes: [
            {
              _id: opaqueGroupId,
              description: null,
              name: mockCustomerGroup.name,
              permissions: mockCustomerGroup.permissions
            }
          ]
        },
        metafields: [
          {
            description: "mockDescription",
            key: "mockKey",
            namespace: "mockNamespace",
            scope: "mockScope",
            value: "mockValue",
            valueType: "mockValueType"
          }
        ],
        name: "mockName",
        note: "mockNote",
        preferences: {},
        updatedAt: jasmine.any(String)
      }
    });
  });
});
