import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import faker from "faker";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";
import Factory from "/tests/util/factory.js";

const AddressValidationQuery = importAsString("./AddressValidationQuery.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const shopName = "Test Shop";
let mockAddressValidationRule;
let testApp;
let addressValidationQuery;

const mockAddress = {
  address1: faker.address.streetAddress(),
  address2: faker.address.secondaryAddress(),
  country: "US",
  city: faker.address.city(),
  postal: "80423",
  region: "CA",
  phone: faker.phone.phoneNumber(),
  fullName: faker.name.firstName() + faker.name.lastName()
};

const mockInvalidAddress = {
  ...mockAddress,
  postal: "81423"
};

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);

  await testApp.start();
  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });
  addressValidationQuery = testApp.query(AddressValidationQuery);

  // Create mockmockAddressValidationRule
  mockAddressValidationRule = Factory.AddressValidationRule.makeOne({
    serviceName: "test",
    countryCodes: ["US"],
    shopId
  });
  await testApp.collections.AddressValidationRules.insertOne(mockAddressValidationRule);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user should be able to validate an address", async () => {
  let result;
  try {
    result = await addressValidationQuery({
      address: mockAddress,
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addressValidation.suggestedAddresses[0]).toEqual({
    address1: jasmine.any(String),
    address2: jasmine.any(String),
    city: jasmine.any(String),
    country: jasmine.any(String),
    postal: jasmine.any(String),
    region: jasmine.any(String)
  });

  expect(result.addressValidation.validationErrors.length).toEqual(0);
});

test("expect address validation error with invalid address", async () => {
  let result;
  try {
    result = await addressValidationQuery({
      address: mockInvalidAddress,
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addressValidation.validationErrors.length).toEqual(1);
});
