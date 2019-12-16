import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const createAddressValidationRuleMutation = importAsString("./createAddressValidationRule.graphql");

jest.setTimeout(300000);

let createAddressValidationRule;
let mockAdminAccount;
let mockNonAdminAccount;
let shopId;
let shopOpaqueId;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  createAddressValidationRule = testApp.mutate(createAddressValidationRuleMutation);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    roles: {
      [shopId]: ["admin", "shopManagerGroupPermission", "someOtherPermission", "customerGroupPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockNonAdminAccount = Factory.Account.makeOne({
    _id: "mockNonAdminAccount",
    roles: {
      [shopId]: ["shopManagerGroupPermission", "someOtherPermission", "customerGroupPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockNonAdminAccount);

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.AddressValidationRules.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("admin can create an address validation rule", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const input = {
    countryCodes: ["US"],
    serviceName: "test",
    shopId: shopOpaqueId
  };

  let result;
  try {
    result = await createAddressValidationRule(input);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: createdOpaqueId, ...addressValidationRule } = result.createAddressValidationRule.addressValidationRule;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  expect(addressValidationRule).toEqual({
    createdAt: jasmine.any(String),
    countryCodes: ["US"],
    serviceName: "test",
    shopId: shopOpaqueId,
    updatedAt: jasmine.any(String)
  });

  // Check the database for the new document
  const createdRuleDatabaseId = decodeOpaqueIdForNamespace("reaction/addressValidationRule")(createdOpaqueId);

  const savedRule = await testApp.collections.AddressValidationRules.findOne({ _id: createdRuleDatabaseId });

  expect(savedRule).toEqual({
    _id: createdRuleDatabaseId,
    createdAt: jasmine.any(Date),
    countryCodes: ["US"],
    serviceName: "test",
    shopId,
    updatedAt: jasmine.any(Date)
  });
});

test("non-admin cannot create an address validation rule", async () => {
  await testApp.setLoggedInUser(mockNonAdminAccount);

  const input = {
    countryCodes: ["US"],
    serviceName: "test",
    shopId: shopOpaqueId
  };

  try {
    await createAddressValidationRule(input);
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }
});
