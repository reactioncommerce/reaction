import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import AdministratorsFullQuery from "./AdministratorsFullQuery.graphql";

jest.setTimeout(300000);

/**
 * @param {Object} mongoAccount The Account document in MongoDB schema
 * @returns {Object} The Account document in GraphQL schema
 */
function accountMongoSchemaToGraphQL(mongoAccount) {
  return {
    _id: encodeAccountOpaqueId(mongoAccount._id),
    addressBook: {
      nodes: [
        { address1: "mockAddress1" }
      ]
    },
    createdAt: mongoAccount.createdAt.toISOString(),
    currency: null,
    emailRecords: [
      {
        address: mongoAccount.emails[0].address,
        verified: mongoAccount.emails[0].verified
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
    updatedAt: mongoAccount.updatedAt.toISOString()
  };
}

let testApp;
let administratorsQuery;
let mockAdminOneAccount;
let mockAdminTwoAccount;
let mockOtherAccount;
let opaqueShopId;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  const shopId = await testApp.insertPrimaryShop();
  opaqueShopId = encodeShopOpaqueId(shopId);

  mockAdminOneAccount = Factory.Account.makeOne({
    roles: {
      [shopId]: ["admin"]
    }
  });
  await testApp.createUserAndAccount(mockAdminOneAccount);

  mockAdminTwoAccount = Factory.Account.makeOne({
    roles: {
      [shopId]: ["admin"]
    }
  });
  await testApp.createUserAndAccount(mockAdminTwoAccount);

  mockOtherAccount = Factory.Account.makeOne();
  await testApp.createUserAndAccount(mockOtherAccount);

  administratorsQuery = testApp.query(AdministratorsFullQuery);
});

afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  try {
    await administratorsQuery({ shopId: opaqueShopId });
  } catch (error) {
    expect(error[0].message).toBe("User does not have permission");
  }
});

test("authenticated as admin", async () => {
  await testApp.setLoggedInUser(mockAdminOneAccount);

  const nodes = [
    accountMongoSchemaToGraphQL(mockAdminOneAccount),
    accountMongoSchemaToGraphQL(mockAdminTwoAccount)
  ];

  // Default sortBy is createdAt ascending
  nodes.sort((item1, item2) => {
    if (item1.createdAt > item2.createdAt) return 1;
    if (item1.createdAt < item2.createdAt) return -1;
    return 0;
  });

  const result = await administratorsQuery({ shopId: opaqueShopId });
  expect(result).toEqual({
    administrators: {
      nodes
    }
  });

  await testApp.clearLoggedInUser();
});

test("authenticated as non-admin", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  try {
    await administratorsQuery({ shopId: opaqueShopId });
  } catch (error) {
    expect(error[0].message).toBe("User does not have permission");
  }

  await testApp.clearLoggedInUser();
});
