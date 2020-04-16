import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const createAddressValidationRuleMutation = importAsString("./createAddressValidationRule.graphql");

jest.setTimeout(300000);

let createAddressValidationRule;
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
