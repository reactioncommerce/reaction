import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const createTaxRateMutation = importAsString("./createTaxRateMutation.graphql");

jest.setTimeout(300000);

let createTaxRate;
let mockAdminAccount;
let shopId;
let shopOpaqueId;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  createTaxRate = testApp.mutate(createTaxRateMutation);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    roles: {
      [shopId]: ["admin", "shopManagerGroupPermission", "someOtherPermission", "customerGroupPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("user can add an address to their own address book", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const taxRate = {
    shopId: shopOpaqueId,
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    taxCode: "CODE"
  };

  let result;
  try {
    result = await createTaxRate(taxRate);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: createdTaxRateOpaqueId, ...createdTaxRate } = result.createTaxRate.taxRate;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedTaxRateResponse = {
    shop: {
      _id: shopOpaqueId
    },
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    taxCode: "CODE"
  };

  expect(createdTaxRate).toEqual(expectedTaxRateResponse);

  // Check the database for the new TaxRate document
  const createdTaxRateDatabaseId = decodeOpaqueIdForNamespace("reaction/taxRate")(createdTaxRateOpaqueId);

  const savedTaxRate = await testApp.collections.TaxRates.findOne({
    _id: createdTaxRateDatabaseId,
    shopId
  });

  // The document we expect to see in the database
  const expectedTaxRateDocument = {
    _id: createdTaxRateDatabaseId,
    shopId,
    region: "CA",
    rate: 0.10,
    country: "USA",
    postal: "90066",
    taxCode: "CODE"
  };

  expect(savedTaxRate).toEqual(expectedTaxRateDocument);
});
