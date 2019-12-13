import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";
import addressValidation from "./testAddressValidationService.js";

const AddressValidationQuery = importAsString("./AddressValidationQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let addressValidationQuery;

const mockAddress = {
  fullName: "Reaction Commerce",
  address1: "2110 Main street",
  address2: "Suite 206",
  country: "US",
  city: "Santa Monica",
  postal: "90405",
  region: "CA",
  phone: "310 555 555"
};

beforeAll(async () => {
  testApp = new TestApp();

  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  addressValidationQuery = testApp.query(AddressValidationQuery);

  testApp.registerPlugin({
    label: "Address Validation Test",
    name: "address-validation-test",
    addressValidationServices: [
      {
        displayName: "Test Validation",
        functions: {
          addressValidation
        },
        name: "test",
        supportedCountryCodes: ["US", "CA"]
      }
    ]
  });
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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

  console.log(JSON.stringify(result, null, 2));
});
