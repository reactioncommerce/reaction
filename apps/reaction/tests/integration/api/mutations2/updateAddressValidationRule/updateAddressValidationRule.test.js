import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const createAddressValidationRuleMutation = importAsString("../createAddressValidationRule/createAddressValidationRule.graphql");
const updateAddressValidationRuleMutation = importAsString("./updateAddressValidationRule.graphql");

jest.setTimeout(300000);

let createAddressValidationRule;
let updateAddressValidationRule;
let mockAdminAccount;
let mockNonAdminAccount;
let shopId;
let shopOpaqueId;
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
  createAddressValidationRule = testApp.mutate(createAddressValidationRuleMutation);
  updateAddressValidationRule = testApp.mutate(updateAddressValidationRuleMutation);

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

test("admin can update an address validation rule service name and country list", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const input = {
    serviceName: "test",
    shopId: shopOpaqueId
  };

  const {
    createAddressValidationRule: {
      addressValidationRule: {
        _id: ruleId,
        updatedAt
      }
    }
  } = await createAddressValidationRule(input);

  let result;
  try {
    result = await updateAddressValidationRule({
      countryCodes: ["US"],
      ruleId,
      serviceName: "test2",
      shopId: shopOpaqueId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: updatedOpaqueId, ...updatedRule } = result.updateAddressValidationRule.addressValidationRule;

  expect(updatedRule).toEqual({
    createdAt: jasmine.any(String),
    countryCodes: ["US"],
    serviceName: "test2",
    shopId: shopOpaqueId,
    updatedAt: jasmine.any(String)
  });

  // Verify the updatedAt changed
  expect(new Date(updatedAt) < new Date(updatedRule.updatedAt)).toBe(true);

  // Verify the rule is updated in the database
  const updatedRuleDatabaseId = decodeOpaqueIdForNamespace("reaction/addressValidationRule")(updatedOpaqueId);

  const rule = await testApp.collections.AddressValidationRules.findOne({ _id: updatedRuleDatabaseId });
  expect(rule).toEqual({
    _id: updatedRuleDatabaseId,
    createdAt: jasmine.any(Date),
    countryCodes: ["US"],
    serviceName: "test2",
    shopId,
    updatedAt: jasmine.any(Date)
  });
});

test("update fails if you do not pass a service name", async () => {
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

  try {
    await updateAddressValidationRule({
      ruleId,
      shopId: shopOpaqueId
    });
  } catch (errors) {
    expect(errors[0].message).toBe("Variable \"$serviceName\" of required type \"String!\" was not provided.");
  }
});

test("non-admin cannot update an address validation rule", async () => {
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
    await updateAddressValidationRule({
      countryCodes: ["US"],
      ruleId,
      serviceName: "test2",
      shopId: shopOpaqueId
    });
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }
});
