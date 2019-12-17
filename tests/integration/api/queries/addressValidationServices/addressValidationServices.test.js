import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const AddressValidationServicesQuery = importAsString("./AddressValidationServicesQuery.graphql");

jest.setTimeout(300000);

const shopId = "123";
const shopName = "Test Shop";
let testApp;
let addressValidationServices;

beforeAll(async () => {
  testApp = new TestApp();

  await testApp.start();
  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });

  addressValidationServices = testApp.query(AddressValidationServicesQuery);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("list available address validation services", async () => {
  let result;

  try {
    result = await addressValidationServices();
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addressValidationServices[0].name).toEqual("test");
  expect(result.addressValidationServices[0].supportedCountryCodes[0]).toEqual("US");
});
