import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import AccountFullQuery from "./AccountFullQuery.graphql";

jest.setTimeout(300000);

const internalNonAdminAccountId = "123";
const opaqueNonAdminAccountId = "cmVhY3Rpb24vYWNjb3VudDoxMjM=";
const internalAdminAccountId = "456";
const internalOtherAccountId = "789";
const opaqueOtherAccountId = "cmVhY3Rpb24vYWNjb3VudDo3ODk=";

let testApp;
let accountQuery;
let mockNonAdminAccount;
let mockAdminAccount;
let mockOtherAccount;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  mockNonAdminAccount = Factory.Account.makeOne({
    _id: internalNonAdminAccountId
  });
  await testApp.createUserAndAccount(mockNonAdminAccount);

  mockAdminAccount = Factory.Account.makeOne({
    _id: internalAdminAccountId
  });
  await testApp.createUserAndAccount(mockAdminAccount, ["reaction-accounts"]);

  mockOtherAccount = Factory.Account.makeOne({
    _id: internalOtherAccountId
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  accountQuery = testApp.query(AccountFullQuery);
});

afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  try {
    await accountQuery({ id: opaqueNonAdminAccountId });
  } catch (error) {
    expect(error[0].message).toBe("User does not have permission");
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
        createdAt: mockNonAdminAccount.createdAt.toISOString(),
        currency: null,
        emailRecords: [
          {
            address: mockNonAdminAccount.emails[0].address,
            verified: mockNonAdminAccount.emails[0].verified
          }
        ],
        groups: {
          nodes: null
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
        shop: null,
        taxSettings: {
          customerUsageType: "mockCustomerUsageType",
          exemptionNo: "mockExemptionNo"
        },
        updatedAt: mockNonAdminAccount.updatedAt.toISOString()
      }
    });
  });

  test("get other account", async () => {
    try {
      await accountQuery({ id: opaqueOtherAccountId });
    } catch (error) {
      expect(error[0].message).toBe("User does not have permission");
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
        createdAt: mockOtherAccount.createdAt.toISOString(),
        currency: null,
        emailRecords: [
          {
            address: mockOtherAccount.emails[0].address,
            verified: mockOtherAccount.emails[0].verified
          }
        ],
        groups: {
          nodes: null
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
        shop: null,
        taxSettings: {
          customerUsageType: "mockCustomerUsageType",
          exemptionNo: "mockExemptionNo"
        },
        updatedAt: mockOtherAccount.updatedAt.toISOString()
      }
    });
  });
});
