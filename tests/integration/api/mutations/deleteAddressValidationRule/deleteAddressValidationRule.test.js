import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const createAddressValidationRuleMutation = importAsString("../createAddressValidationRule/createAddressValidationRule.graphql");
const deleteAddressValidationRuleMutation = importAsString("./deleteAddressValidationRule.graphql");

jest.setTimeout(300000);

let createAddressValidationRule;
let deleteAddressValidationRule;
let mockAdminAccount;
let mockNonAdminAccount;
let shopId;
let shopOpaqueId;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: [
      "reaction:legacy:addressValidationRules/create",
      "reaction:legacy:addressValidationRules/delete",
      "reaction:legacy:addressValidationRules/read",
      "reaction:legacy:addressValidationRules/update"
    ],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  const customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    createdBy: null,
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  createAddressValidationRule = testApp.mutate(createAddressValidationRuleMutation);
  deleteAddressValidationRule = testApp.mutate(deleteAddressValidationRuleMutation);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockNonAdminAccount = Factory.Account.makeOne({
    _id: "mockNonAdminAccount",
    groups: [customerGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockNonAdminAccount);

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("admin can delete an address validation rule", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const input = {
    serviceName: "test",
    shopId: shopOpaqueId
  };

  const {
    createAddressValidationRule: {
      addressValidationRule: {
        _id: ruleId,
        ...createdRule
      }
    }
  } = await createAddressValidationRule(input);

  let result;
  try {
    result = await deleteAddressValidationRule({
      ruleId,
      shopId: shopOpaqueId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: deletedOpaqueId, ...deletedRule } = result.deleteAddressValidationRule.addressValidationRule;

  expect(deletedRule).toEqual(createdRule);

  // Verify the rule is gone from the database
  const deletedRuleDatabaseId = decodeOpaqueIdForNamespace("reaction/addressValidationRule")(deletedOpaqueId);

  const rule = await testApp.collections.AddressValidationRules.findOne({ _id: deletedRuleDatabaseId });
  expect(rule).toBe(null);
});

test("non-admin cannot delete an address validation rule", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const input = {
    serviceName: "test",
    shopId: shopOpaqueId
  };

  const {
    createAddressValidationRule: {
      addressValidationRule: {
        _id: ruleId
      }
    }
  } = await createAddressValidationRule(input);

  await testApp.setLoggedInUser(mockNonAdminAccount);

  try {
    await deleteAddressValidationRule({
      ruleId,
      shopId: shopOpaqueId
    });
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }
});
